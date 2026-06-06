import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = path.join(__dirname, 'app.db')

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

export function initDb(): void {
  const database = getDb()

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'reception', 'warehouse')),
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS props (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      description TEXT DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'in_stock' CHECK(status IN ('in_stock', 'borrowed', 'checking', 'missing_parts', 'deleted')),
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(group_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS workflow_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workflow_template_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      FOREIGN KEY (template_id) REFERENCES workflow_templates(id),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      UNIQUE(template_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS workflow_nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      handler_role TEXT NOT NULL CHECK(handler_role IN ('admin', 'reception', 'warehouse')),
      time_limit_hours INTEGER NOT NULL DEFAULT 24,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (template_id) REFERENCES workflow_templates(id)
    );

    CREATE TABLE IF NOT EXISTS borrow_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prop_id INTEGER NOT NULL,
      borrower_id INTEGER NOT NULL,
      purpose TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'borrowed' CHECK(status IN ('borrowed', 'returned', 'checking', 'missing_parts', 'placed')),
      borrowed_at TEXT NOT NULL DEFAULT (datetime('now')),
      expected_return_at TEXT,
      returned_at TEXT,
      workflow_template_id INTEGER,
      current_node_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (prop_id) REFERENCES props(id),
      FOREIGN KEY (borrower_id) REFERENCES users(id),
      FOREIGN KEY (workflow_template_id) REFERENCES workflow_templates(id)
    );

    CREATE TABLE IF NOT EXISTS missing_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      borrow_record_id INTEGER NOT NULL,
      missing_parts TEXT NOT NULL,
      damage_desc TEXT DEFAULT '',
      responsible_group_id INTEGER,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'resolved')),
      resolution TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at TEXT,
      FOREIGN KEY (borrow_record_id) REFERENCES borrow_records(id),
      FOREIGN KEY (responsible_group_id) REFERENCES groups(id)
    );

    CREATE TABLE IF NOT EXISTS flow_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      borrow_record_id INTEGER NOT NULL,
      node_id INTEGER,
      action TEXT NOT NULL,
      operator_role TEXT NOT NULL,
      operator_id INTEGER NOT NULL,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (borrow_record_id) REFERENCES borrow_records(id),
      FOREIGN KEY (node_id) REFERENCES workflow_nodes(id),
      FOREIGN KEY (operator_id) REFERENCES users(id)
    );
  `)

  const userCount = database.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  if (userCount.count === 0) {
    const insertUser = database.prepare(
      'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)'
    )
    const salt = bcrypt.genSaltSync(10)

    insertUser.run('admin', bcrypt.hashSync('admin123', salt), '系统管理员', 'admin')
    insertUser.run('reception', bcrypt.hashSync('reception123', salt), '接待人员', 'reception')
    insertUser.run('warehouse', bcrypt.hashSync('warehouse123', salt), '仓库人员', 'warehouse')
  }
}
