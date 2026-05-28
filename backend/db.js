require('dotenv').config();

const { DBSQLClient } = require("@databricks/sql");

const serverConfig = {
    host: process.env.DATABRICKS_HOST,
    path: process.env.DATABRICKS_PATH,
    token: process.env.DATABRICKS_TOKEN
};

const client = new DBSQLClient();

async function getSession() {
    const connection = await client.connect(serverConfig);
    return await connection.openSession();
}

async function safeCount(session, table) {
    try {
        const q = await session.executeStatement(`SELECT COUNT(*) as cnt FROM workspace.netflixdb.${table}`);
        const r = await q.fetchAll();
        await q.close();
        return Number(r[0]?.cnt) || 0;
    } catch (e) {
        console.warn(`Table ${table} not found, returning 0`);
        return 0;
    }
}

async function safeSum(session, table, field, condition) {
    try {
        const q = await session.executeStatement(`SELECT COALESCE(SUM(${field}), 0) as total FROM workspace.netflixdb.${table} WHERE ${condition}`);
        const r = await q.fetchAll();
        await q.close();
        return parseFloat(r[0]?.total) || 0;
    } catch (e) {
        console.warn(`Table ${table} not found for sum, returning 0`);
        return 0;
    }
}

module.exports = { getSession, safeCount, safeSum };
