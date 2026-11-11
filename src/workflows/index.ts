/**
 * Render Workflows Entry Point for PayAgent
 *
 * This file is executed when the Render Workflows service starts.
 * Importing task and flow definitions registers them with the Render Workflows runtime,
 * which starts the task server on the configured unix domain socket or port.
 */

import "./shoppingWorkflow";

console.log("⚡ PayAgent Render Workflows Server Initialized");
console.log("Registered Tasks: [parseIntentTask, searchCatalogTask, createPayPalOrderTask]");
console.log("Registered Flows: [autonomousShoppingWorkflow]");
