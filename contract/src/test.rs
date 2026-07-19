#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::Env;

fn setup(env: &Env) -> (XpensContractClient, Address) {
    let contract_id = env.register(XpensContract, ());
    let client = XpensContractClient::new(env, &contract_id);
    let owner = Address::generate(env);
    (client, owner)
}

#[test]
fn test_add_expense_returns_incrementing_ids() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, owner) = setup(&env);

    let id1 = client.add_expense(
        &owner,
        &String::from_str(&env, "Coffee"),
        &25000, // 250.00 in paise
        &String::from_str(&env, "Food"),
        &1_700_000_000,
    );
    let id2 = client.add_expense(
        &owner,
        &String::from_str(&env, "Metro ticket"),
        &4000,
        &String::from_str(&env, "Travel"),
        &1_700_000_100,
    );

    assert_eq!(id1, 1);
    assert_eq!(id2, 2);

    let expenses = client.get_expenses(&owner);
    assert_eq!(expenses.len(), 2);
    // most recent is pushed to the front
    assert_eq!(expenses.get(0).unwrap().desc, String::from_str(&env, "Metro ticket"));
}

#[test]
fn test_delete_expense_removes_only_target() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, owner) = setup(&env);

    let id1 = client.add_expense(
        &owner,
        &String::from_str(&env, "Groceries"),
        &50000,
        &String::from_str(&env, "Food"),
        &1_700_000_000,
    );
    let _id2 = client.add_expense(
        &owner,
        &String::from_str(&env, "Movie"),
        &30000,
        &String::from_str(&env, "Entertainment"),
        &1_700_000_200,
    );

    client.delete_expense(&owner, &id1);

    let expenses = client.get_expenses(&owner);
    assert_eq!(expenses.len(), 1);
    assert_eq!(expenses.get(0).unwrap().desc, String::from_str(&env, "Movie"));
}

#[test]
fn test_get_summary_computes_total_count_average() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, owner) = setup(&env);

    client.add_expense(
        &owner,
        &String::from_str(&env, "Rent"),
        &1_000_000,
        &String::from_str(&env, "Bills"),
        &1_700_000_000,
    );
    client.add_expense(
        &owner,
        &String::from_str(&env, "Internet"),
        &200_000,
        &String::from_str(&env, "Bills"),
        &1_700_000_100,
    );

    let summary = client.get_summary(&owner);
    assert_eq!(summary.total, 1_200_000);
    assert_eq!(summary.count, 2);
    assert_eq!(summary.average, 600_000);
}

#[test]
fn test_clear_expenses_empties_list() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, owner) = setup(&env);

    client.add_expense(
        &owner,
        &String::from_str(&env, "Snacks"),
        &1500,
        &String::from_str(&env, "Food"),
        &1_700_000_000,
    );
    client.clear_expenses(&owner);

    let expenses = client.get_expenses(&owner);
    assert_eq!(expenses.len(), 0);
}

#[test]
fn test_each_owner_has_isolated_storage() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(XpensContract, ());
    let client = XpensContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    client.add_expense(
        &alice,
        &String::from_str(&env, "Alice's lunch"),
        &10000,
        &String::from_str(&env, "Food"),
        &1_700_000_000,
    );

    // Bob has never added anything — his list must be empty, proving
    // per-wallet storage isolation.
    let bob_expenses = client.get_expenses(&bob);
    assert_eq!(bob_expenses.len(), 0);

    let alice_expenses = client.get_expenses(&alice);
    assert_eq!(alice_expenses.len(), 1);
}

#[test]
#[should_panic(expected = "amount must be positive")]
fn test_add_expense_rejects_zero_amount() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, owner) = setup(&env);

    client.add_expense(
        &owner,
        &String::from_str(&env, "Invalid"),
        &0,
        &String::from_str(&env, "Other"),
        &1_700_000_000,
    );
}
