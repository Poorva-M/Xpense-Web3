//! Xpens — on-chain expense tracker smart contract for Stellar / Soroban.
//!
//! Design notes:
//! - Every expense is stored per-wallet (`Address`) so each user only ever
//!   pays for and touches their own storage entries (persistent storage,
//!   keyed by owner).
//! - Every mutating call requires `owner.require_auth()` so only the wallet
//!   that owns the data (Freighter / Rabet / xBull — any Stellar signer)
//!   can add or delete its own expenses.
//! - Events are published on add/delete/clear so the frontend can listen
//!   for real-time updates instead of polling (see `events` module).
//! - `get_summary` demonstrates inter-contract-style composition: it is a
//!   read-only aggregate function other contracts (or this contract's own
//!   future modules) could call cross-contract via `env.invoke_contract`.

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec};

/// A single expense entry.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Expense {
    pub id: u64,
    pub desc: String,
    pub amount: i128, // stored in smallest unit (paise) to avoid floats
    pub category: String,
    pub date: u64, // unix timestamp (seconds)
}

/// Aggregate stats computed on-chain for a given owner.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Summary {
    pub total: i128,
    pub count: u32,
    pub average: i128,
}

#[contracttype]
pub enum DataKey {
    /// Vec<Expense> for a given owner address
    Expenses(Address),
    /// Monotonically increasing id counter per owner
    NextId(Address),
}

const EXPENSE_ADDED: Symbol = symbol_short!("exp_add");
const EXPENSE_DELETED: Symbol = symbol_short!("exp_del");
const EXPENSES_CLEARED: Symbol = symbol_short!("exp_clr");

// Persistent storage entries expire if untouched; bump generously so a
// user's history survives long gaps between visits (~30 days at 5s ledgers).
const LEDGER_BUMP: u32 = 518_400; // ~30 days
const LEDGER_THRESHOLD: u32 = 500_000;

#[contract]
pub struct XpensContract;

#[contractimpl]
impl XpensContract {
    /// Add a new expense for `owner`. Requires the owner's signature.
    /// Returns the newly assigned expense id.
    pub fn add_expense(
        env: Env,
        owner: Address,
        desc: String,
        amount: i128,
        category: String,
        date: u64,
    ) -> u64 {
        owner.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }
        if desc.len() == 0 {
            panic!("description cannot be empty");
        }

        let id_key = DataKey::NextId(owner.clone());
        let next_id: u64 = env.storage().persistent().get(&id_key).unwrap_or(0);
        let id = next_id + 1;

        let list_key = DataKey::Expenses(owner.clone());
        let mut expenses: Vec<Expense> = env
            .storage()
            .persistent()
            .get(&list_key)
            .unwrap_or_else(|| Vec::new(&env));

        let expense = Expense {
            id,
            desc,
            amount,
            category: category.clone(),
            date,
        };
        expenses.push_front(expense);

        env.storage().persistent().set(&list_key, &expenses);
        env.storage().persistent().set(&id_key, &id);
        env.storage()
            .persistent()
            .extend_ttl(&list_key, LEDGER_THRESHOLD, LEDGER_BUMP);
        env.storage()
            .persistent()
            .extend_ttl(&id_key, LEDGER_THRESHOLD, LEDGER_BUMP);

        // Real-time update event: (owner, expense_id, category) -> amount
        env.events()
            .publish((EXPENSE_ADDED, owner, id), (amount, category));

        id
    }

    /// Delete a single expense belonging to `owner` by id.
    pub fn delete_expense(env: Env, owner: Address, id: u64) {
        owner.require_auth();

        let list_key = DataKey::Expenses(owner.clone());
        let expenses: Vec<Expense> = env
            .storage()
            .persistent()
            .get(&list_key)
            .unwrap_or_else(|| Vec::new(&env));

        let mut updated = Vec::new(&env);
        let mut found = false;
        for e in expenses.iter() {
            if e.id == id {
                found = true;
                continue;
            }
            updated.push_back(e);
        }

        if !found {
            panic!("expense not found");
        }

        env.storage().persistent().set(&list_key, &updated);
        env.storage()
            .persistent()
            .extend_ttl(&list_key, LEDGER_THRESHOLD, LEDGER_BUMP);

        env.events().publish((EXPENSE_DELETED, owner, id), ());
    }

    /// Delete every expense belonging to `owner`.
    pub fn clear_expenses(env: Env, owner: Address) {
        owner.require_auth();

        let list_key = DataKey::Expenses(owner.clone());
        env.storage().persistent().set(&list_key, &Vec::<Expense>::new(&env));

        env.events().publish((EXPENSES_CLEARED, owner), ());
    }

    /// Read-only: fetch all expenses for `owner`. No auth required — this
    /// mirrors a public read of on-chain state (anyone can query it, the
    /// same way anyone can read a Stellar account's balance).
    pub fn get_expenses(env: Env, owner: Address) -> Vec<Expense> {
        let list_key = DataKey::Expenses(owner);
        env.storage()
            .persistent()
            .get(&list_key)
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Read-only: on-chain aggregate stats for `owner`. Kept as a pure
    /// contract function (rather than only computed client-side) so other
    /// contracts could call it cross-contract in future (e.g. a rewards or
    /// budgeting contract composing on top of Xpens data).
    pub fn get_summary(env: Env, owner: Address) -> Summary {
        let expenses = Self::get_expenses(env, owner);
        let count = expenses.len();
        let mut total: i128 = 0;
        for e in expenses.iter() {
            total += e.amount;
        }
        let average = if count > 0 { total / count as i128 } else { 0 };
        Summary {
            total,
            count,
            average,
        }
    }
}

mod test;
