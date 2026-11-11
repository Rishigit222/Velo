-- =============================================================================
-- VELO — SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Generated automatically from SQLAlchemy 2.0 Models
-- Compatible with Supabase (PostgreSQL 15+)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- Table: users
-- -------------------------------------------------------------
CREATE TABLE users (
	id SERIAL NOT NULL, 
	full_name VARCHAR(255) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	role VARCHAR(50) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE INDEX ix_users_id ON users (id);


-- -------------------------------------------------------------
-- Table: products
-- -------------------------------------------------------------
CREATE TABLE products (
	id SERIAL NOT NULL, 
	product_name VARCHAR(255) NOT NULL, 
	description TEXT, 
	sku VARCHAR(100), 
	category VARCHAR(100), 
	brand VARCHAR(255), 
	price FLOAT DEFAULT '0.0' NOT NULL, 
	serial_number VARCHAR(255), 
	seller_id INTEGER, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_products_category ON products (category);
CREATE UNIQUE INDEX ix_products_serial_number ON products (serial_number);
CREATE INDEX ix_products_id ON products (id);
CREATE INDEX ix_products_seller_id ON products (seller_id);
CREATE UNIQUE INDEX ix_products_sku ON products (sku);


-- -------------------------------------------------------------
-- Table: orders
-- -------------------------------------------------------------
CREATE TABLE orders (
	id SERIAL NOT NULL, 
	order_number VARCHAR(100) NOT NULL, 
	buyer_id INTEGER NOT NULL, 
	seller_id INTEGER, 
	product_id INTEGER, 
	quantity INTEGER DEFAULT '1' NOT NULL, 
	total_amount FLOAT DEFAULT '0.0' NOT NULL, 
	tracking_number VARCHAR(100), 
	delivery_date TIMESTAMP WITH TIME ZONE, 
	order_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	status VARCHAR(50) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(buyer_id) REFERENCES users (id) ON DELETE CASCADE, 
	FOREIGN KEY(seller_id) REFERENCES users (id) ON DELETE SET NULL, 
	FOREIGN KEY(product_id) REFERENCES products (id) ON DELETE SET NULL
);

CREATE INDEX ix_orders_buyer_id ON orders (buyer_id);
CREATE INDEX ix_orders_seller_id ON orders (seller_id);
CREATE INDEX ix_orders_tracking_number ON orders (tracking_number);
CREATE UNIQUE INDEX ix_orders_order_number ON orders (order_number);
CREATE INDEX ix_orders_product_id ON orders (product_id);
CREATE INDEX ix_orders_id ON orders (id);


-- -------------------------------------------------------------
-- Table: evidence_sessions
-- -------------------------------------------------------------
CREATE TABLE evidence_sessions (
	id SERIAL NOT NULL, 
	order_id INTEGER NOT NULL, 
	session_type VARCHAR(50) NOT NULL, 
	created_by INTEGER, 
	session_status VARCHAR(50) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	completed_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(order_id) REFERENCES orders (id) ON DELETE CASCADE, 
	FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_evidence_sessions_id ON evidence_sessions (id);
CREATE INDEX ix_evidence_sessions_created_by ON evidence_sessions (created_by);
CREATE INDEX ix_evidence_sessions_session_type ON evidence_sessions (session_type);
CREATE INDEX ix_evidence_sessions_order_id ON evidence_sessions (order_id);
CREATE INDEX ix_evidence_sessions_session_status ON evidence_sessions (session_status);


-- -------------------------------------------------------------
-- Table: evidence_files
-- -------------------------------------------------------------
CREATE TABLE evidence_files (
	id SERIAL NOT NULL, 
	session_id INTEGER NOT NULL, 
	file_name VARCHAR(255) NOT NULL, 
	file_type VARCHAR(100) NOT NULL, 
	file_path VARCHAR(500) NOT NULL, 
	file_hash VARCHAR(64) NOT NULL, 
	file_size INTEGER NOT NULL, 
	uploaded_by INTEGER, 
	uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(session_id) REFERENCES evidence_sessions (id) ON DELETE CASCADE, 
	FOREIGN KEY(uploaded_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_evidence_files_uploaded_by ON evidence_files (uploaded_by);
CREATE INDEX ix_evidence_files_id ON evidence_files (id);
CREATE INDEX ix_evidence_files_session_id ON evidence_files (session_id);
CREATE INDEX ix_evidence_files_file_hash ON evidence_files (file_hash);


-- -------------------------------------------------------------
-- Table: condition_reports
-- -------------------------------------------------------------
CREATE TABLE condition_reports (
	id SERIAL NOT NULL, 
	session_id INTEGER NOT NULL, 
	product_condition VARCHAR(100) NOT NULL, 
	damage_description TEXT, 
	accessories_status VARCHAR(100), 
	packaging_condition VARCHAR(100), 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(session_id) REFERENCES evidence_sessions (id) ON DELETE CASCADE
);

CREATE INDEX ix_condition_reports_id ON condition_reports (id);
CREATE INDEX ix_condition_reports_session_id ON condition_reports (session_id);


-- -------------------------------------------------------------
-- Table: verification_results
-- -------------------------------------------------------------
CREATE TABLE verification_results (
	id SERIAL NOT NULL, 
	order_id INTEGER NOT NULL, 
	original_session_id INTEGER, 
	return_session_id INTEGER, 
	identity_result VARCHAR(50) NOT NULL, 
	damage_result VARCHAR(50) NOT NULL, 
	accessories_result VARCHAR(50) NOT NULL, 
	overall_status VARCHAR(50) NOT NULL, 
	confidence_score FLOAT, 
	findings TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(order_id) REFERENCES orders (id) ON DELETE CASCADE, 
	FOREIGN KEY(original_session_id) REFERENCES evidence_sessions (id) ON DELETE SET NULL, 
	FOREIGN KEY(return_session_id) REFERENCES evidence_sessions (id) ON DELETE SET NULL
);

CREATE INDEX ix_verification_results_return_session_id ON verification_results (return_session_id);
CREATE INDEX ix_verification_results_order_id ON verification_results (order_id);
CREATE INDEX ix_verification_results_overall_status ON verification_results (overall_status);
CREATE INDEX ix_verification_results_original_session_id ON verification_results (original_session_id);
CREATE INDEX ix_verification_results_id ON verification_results (id);


-- -------------------------------------------------------------
-- Table: disputes
-- -------------------------------------------------------------
CREATE TABLE disputes (
	id SERIAL NOT NULL, 
	order_id INTEGER NOT NULL, 
	raised_by INTEGER NOT NULL, 
	dispute_reason VARCHAR(255) NOT NULL, 
	description TEXT NOT NULL, 
	status VARCHAR(50) DEFAULT 'submitted' NOT NULL, 
	resolution_details TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(order_id) REFERENCES orders (id) ON DELETE CASCADE, 
	FOREIGN KEY(raised_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_disputes_id ON disputes (id);
CREATE INDEX ix_disputes_status ON disputes (status);
CREATE INDEX ix_disputes_order_id ON disputes (order_id);
CREATE INDEX ix_disputes_raised_by ON disputes (raised_by);


-- -------------------------------------------------------------
-- Table: reports
-- -------------------------------------------------------------
CREATE TABLE reports (
	id SERIAL NOT NULL, 
	order_id INTEGER NOT NULL, 
	generated_by INTEGER, 
	report_type VARCHAR(50) DEFAULT 'evidence_dossier' NOT NULL, 
	file_path VARCHAR(500) NOT NULL, 
	file_name VARCHAR(255) NOT NULL, 
	file_size INTEGER DEFAULT '0' NOT NULL, 
	file_hash VARCHAR(64) NOT NULL, 
	version VARCHAR(20) DEFAULT '1.0' NOT NULL, 
	status VARCHAR(50) DEFAULT 'ready' NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(order_id) REFERENCES orders (id) ON DELETE CASCADE, 
	FOREIGN KEY(generated_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_reports_generated_by ON reports (generated_by);
CREATE INDEX ix_reports_order_id ON reports (order_id);
CREATE INDEX ix_reports_id ON reports (id);


-- -------------------------------------------------------------
-- Table: audit_logs
-- -------------------------------------------------------------
CREATE TABLE audit_logs (
	id SERIAL NOT NULL, 
	user_id INTEGER, 
	order_id INTEGER, 
	event_type VARCHAR(100) NOT NULL, 
	event_description TEXT NOT NULL, 
	previous_hash VARCHAR(64), 
	current_hash VARCHAR(64) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL, 
	FOREIGN KEY(order_id) REFERENCES orders (id) ON DELETE SET NULL
);

CREATE INDEX ix_audit_logs_event_type ON audit_logs (event_type);
CREATE INDEX ix_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX ix_audit_logs_id ON audit_logs (id);
CREATE INDEX ix_audit_logs_order_id ON audit_logs (order_id);

