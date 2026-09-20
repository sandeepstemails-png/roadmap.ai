import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["learner", "admin"] })
    .notNull()
    .default("learner"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const roadmaps = sqliteTable("roadmaps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const roadmapNodes = sqliteTable("roadmap_nodes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roadmapId: integer("roadmap_id")
    .notNull()
    .references(() => roadmaps.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  resourceUrl: text("resource_url"),
  positionX: integer("position_x").notNull().default(0),
  positionY: integer("position_y").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// A node can point to several learning resources (a video, a course site,
// docs, …) — resourceUrl above only ever held one, so multi-resource nodes
// (e.g. DevOps topics linking both a YouTube channel and a course site)
// need their own rows instead.
export const roadmapNodeResources = sqliteTable("roadmap_node_resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nodeId: integer("node_id")
    .notNull()
    .references(() => roadmapNodes.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  url: text("url").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const roadmapEdges = sqliteTable("roadmap_edges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roadmapId: integer("roadmap_id")
    .notNull()
    .references(() => roadmaps.id, { onDelete: "cascade" }),
  sourceNodeId: integer("source_node_id")
    .notNull()
    .references(() => roadmapNodes.id, { onDelete: "cascade" }),
  targetNodeId: integer("target_node_id")
    .notNull()
    .references(() => roadmapNodes.id, { onDelete: "cascade" }),
});

export const progress = sqliteTable(
  "progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nodeId: integer("node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["not_started", "in_progress", "completed"],
    })
      .notNull()
      .default("not_started"),
    completedAt: text("completed_at"),
  },
  (table) => [unique().on(table.userId, table.nodeId)],
);

export const usersRelations = relations(users, ({ many }) => ({
  roadmaps: many(roadmaps),
  progress: many(progress),
}));

export const roadmapsRelations = relations(roadmaps, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [roadmaps.createdBy],
    references: [users.id],
  }),
  nodes: many(roadmapNodes),
  edges: many(roadmapEdges),
}));

export const roadmapNodesRelations = relations(
  roadmapNodes,
  ({ one, many }) => ({
    roadmap: one(roadmaps, {
      fields: [roadmapNodes.roadmapId],
      references: [roadmaps.id],
    }),
    progress: many(progress),
    resources: many(roadmapNodeResources),
  }),
);

export const roadmapNodeResourcesRelations = relations(
  roadmapNodeResources,
  ({ one }) => ({
    node: one(roadmapNodes, {
      fields: [roadmapNodeResources.nodeId],
      references: [roadmapNodes.id],
    }),
  }),
);

export const roadmapEdgesRelations = relations(roadmapEdges, ({ one }) => ({
  roadmap: one(roadmaps, {
    fields: [roadmapEdges.roadmapId],
    references: [roadmaps.id],
  }),
  source: one(roadmapNodes, {
    fields: [roadmapEdges.sourceNodeId],
    references: [roadmapNodes.id],
    relationName: "sourceNode",
  }),
  target: one(roadmapNodes, {
    fields: [roadmapEdges.targetNodeId],
    references: [roadmapNodes.id],
    relationName: "targetNode",
  }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, {
    fields: [progress.userId],
    references: [users.id],
  }),
  node: one(roadmapNodes, {
    fields: [progress.nodeId],
    references: [roadmapNodes.id],
  }),
}));
