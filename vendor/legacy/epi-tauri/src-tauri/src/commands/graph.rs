use tauri::State;

use crate::error::AppError;
use crate::graph::{
    geometry, BimbaPosition, GeometryClass, GraphData, GraphNode, GraphWalkResult, SubGraphGeometry,
    WalkKind,
};
use crate::state::AppState;

#[tauri::command]
pub async fn graph_connect(state: State<'_, AppState>) -> Result<(), AppError> {
    let settings = state.settings.read().await;
    let client = crate::graph::Neo4jClient::new(
        &settings.neo4j_url,
        &settings.neo4j_user,
        settings.neo4j_password.as_deref().unwrap_or(""),
    )
    .await?;
    *state.neo4j.write().await = Some(client);
    Ok(())
}

#[tauri::command]
pub async fn graph_disconnect(state: State<'_, AppState>) -> Result<(), AppError> {
    *state.neo4j.write().await = None;
    Ok(())
}

#[tauri::command]
pub async fn graph_get_full(state: State<'_, AppState>) -> Result<GraphData, AppError> {
    let guard = state.neo4j.read().await;
    let client = guard
        .as_ref()
        .ok_or_else(|| AppError::Graph("not connected".into()))?;
    client.get_full_graph().await
}

#[tauri::command]
pub async fn graph_get_node(
    id: String,
    state: State<'_, AppState>,
) -> Result<Option<GraphNode>, AppError> {
    let guard = state.neo4j.read().await;
    let client = guard
        .as_ref()
        .ok_or_else(|| AppError::Graph("not connected".into()))?;
    client.get_node_by_id(&id).await
}

#[tauri::command]
pub async fn graph_get_by_coordinate(
    coordinate: String,
    state: State<'_, AppState>,
) -> Result<Option<GraphNode>, AppError> {
    let guard = state.neo4j.read().await;
    let client = guard
        .as_ref()
        .ok_or_else(|| AppError::Graph("not connected".into()))?;
    client.get_by_coordinate(&coordinate).await
}

#[tauri::command]
pub async fn graph_walk(
    start: String,
    kind: WalkKind,
    depth: Option<u32>,
    state: State<'_, AppState>,
) -> Result<GraphWalkResult, AppError> {
    let guard = state.neo4j.read().await;
    let client = guard
        .as_ref()
        .ok_or_else(|| AppError::Graph("not connected".into()))?;
    client.walk(&start, &kind, depth.unwrap_or(3)).await
}

#[tauri::command]
pub async fn graph_query_raw(
    cypher: String,
    params: Option<serde_json::Value>,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, AppError> {
    let guard = state.neo4j.read().await;
    let client = guard
        .as_ref()
        .ok_or_else(|| AppError::Graph("not connected".into()))?;
    client.query_raw(&cypher, params).await
}

#[tauri::command]
pub async fn graph_hexagonal_position(coordinate: String) -> Result<BimbaPosition, AppError> {
    Ok(geometry::calculate_hexagonal_position(&coordinate))
}

#[tauri::command]
pub async fn graph_batch_positions(
    coordinates: Vec<String>,
) -> Result<Vec<(String, BimbaPosition)>, AppError> {
    Ok(geometry::calculate_batch_positions(&coordinates))
}

#[tauri::command]
pub async fn graph_geometry_for(
    coordinate: String,
    _state: State<'_, AppState>,
) -> Result<SubGraphGeometry, AppError> {
    Ok(geometry::default_subgraph_geometry(&coordinate))
}

#[tauri::command]
pub async fn graph_set_geometry_override(
    coordinate: String,
    class: GeometryClass,
    _state: State<'_, AppState>,
) -> Result<SubGraphGeometry, AppError> {
    Ok(SubGraphGeometry {
        root_coordinate: coordinate,
        class,
        orientation_quaternion: [1.0, 0.0, 0.0, 0.0],
        scale: 1.0,
        source: geometry::GeometrySource::Manual,
    })
}
