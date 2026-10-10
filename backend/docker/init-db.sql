-- Runs once on first container start. Creates the isolated test database so the
-- e2e suite never touches development data.
CREATE DATABASE rentino_test OWNER rentino;
