 DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
    END IF;
END$$;
 
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'USER' NOT NULL,
    credits INTEGER DEFAULT 50 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
