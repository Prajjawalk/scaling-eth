// Allow `cargo stylus export-abi` to generate a main function.
#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

/// Use an efficient WASM allocator.
#[global_allocator]
static ALLOC: mini_alloc::MiniAlloc = mini_alloc::MiniAlloc::INIT;

use alloy_primitives::Address;
/// Import items from the SDK. The prelude contains common traits and macros.
use stylus_sdk::prelude::*;

sol_storage! {
  #[entrypoint]
  pub struct Recommendation {
      int64[][] user_activity_matrix;
      mapping(address => int64) address_to_id;
  }
}

pub enum ActivityType {
    Transaction,
    Social,
    Gaming,
    Identity,
    Ecommerce,
}

/// Declare that `Counter` is a contract with the following external methods.
#[external]
impl Recommendation {
    /// Increments `number` and updates its value in storage.
    pub fn add_user(&mut self, user_address: Address, initial_vector: Vec<i64>) {
        let mut matrix = self.user_activity_matrix.grow();
        for i in initial_vector.iter() {
            matrix.push((*i).try_into().unwrap())
        }
        let mut id = self.address_to_id.setter(user_address);
        id.set(self.user_activity_matrix.len().try_into().unwrap())
    }

    pub fn add_analytics(&mut self, user_address: Address, action_index: i64, points: i64) {
        let user_index = self.address_to_id.get(user_address);
        let current_user_analytics = self.user_activity_matrix.getter(user_index).unwrap();
        let current_points = current_user_analytics.getter(action_index).unwrap().get();
        let mut guard = self.user_activity_matrix.setter(user_index).unwrap();
        let mut user_analytics = guard.setter(action_index).unwrap();
        user_analytics.set(
            current_points
                .checked_add(points.try_into().unwrap())
                .unwrap(),
        );
    }

    /*
    Example user activity matrix
    let user_activity_matrix = vec![
        vec![1, 0, 1, 0, 1],
        vec![0, 1, 1, 0, 0],
        vec![1, 1, 0, 1, 0],
        vec![0, 1, 0, 0, 1],
    ];
    */
    #[view]
    pub fn get_recommendations(
        &self,
        user_activity_matrix: Vec<Vec<i64>>,
        user_index: i64,
        k: i64,
    ) -> Vec<Vec<i64>> {
        let similarity_matrix = compute_similarity_matrix(&user_activity_matrix);

        // Recommend followers for user based on similar users and their activities
        let recommended_followers =
            recommend_followers(user_index, &user_activity_matrix, &similarity_matrix, k);
        return recommended_followers;
    }
}

// Function to calculate cosine similarity between two users
fn cosine_similarity(user1: &Vec<i64>, user2: &Vec<i64>) -> i64 {
    let dot_product: i64 = user1.iter().zip(user2.iter()).map(|(x, y)| x * y).sum();
    let norm_user1 = sqrt(user1.iter().zip(user1.iter()).map(|(x, y)| x * y).sum());
    let norm_user2 = sqrt(user2.iter().zip(user2.iter()).map(|(x, y)| x * y).sum());
    dot_product * 100 / (norm_user1 * norm_user2)
}

// Function to compute user-user similarity matrix
fn compute_similarity_matrix(user_activity_matrix: &Vec<Vec<i64>>) -> Vec<Vec<i64>> {
    let num_users = user_activity_matrix.len();
    let mut similarity_matrix = vec![vec![0; num_users]; num_users];

    for i in 0..num_users {
        for j in 0..num_users {
            let user1 = user_activity_matrix[i].clone();
            let user2 = user_activity_matrix[j].clone();
            similarity_matrix[i][j] = cosine_similarity(&user1, &user2);
        }
    }

    similarity_matrix
}

// Function to recommend followers for a given user
fn recommend_followers(
    user_index: i64,
    user_activity_matrix: &Vec<Vec<i64>>,
    similarity_matrix: &Vec<Vec<i64>>,
    k: i64,
) -> Vec<Vec<i64>> {
    let mut similar_users: Vec<(i64, i64)> = Vec::new();

    // Find k most similar users to the target user
    for (other_user_index, &similarity) in similarity_matrix[user_index as usize].iter().enumerate()
    {
        if other_user_index as i64 != user_index {
            similar_users.push((other_user_index as i64, similarity));
        }
    }

    // Sort similar users by descending similarity
    similar_users.sort_by(|(_, sim1), (_, sim2)| sim2.partial_cmp(sim1).unwrap());

    // Recommend followers from the top k similar users
    let mut recommended_followers: Vec<Vec<i64>> = vec![Vec::new(); 5];
    for (similar_user_index, _) in similar_users.iter().take(k as usize) {
        let mut idx: i64 = 0;
        for &activity_value in user_activity_matrix[*similar_user_index as usize].iter() {
            if activity_value > 0 {
                recommended_followers[idx as usize].push(*similar_user_index);
            }
            idx = idx + 1;
        }
    }

    recommended_followers
}

/**
* @dev Returns the square root of a number.
*/
fn sqrt(x: i64) -> i64 {
    let mut z = (x + 1) / 2;
    let mut y = x;
    while z < y {
        y = z;
        z = (x / z + z) / 2;
    }
    return y;
}
