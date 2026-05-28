require('dotenv').config();
const { getSession } = require('./db');

async function main() {
    const session = await getSession();
    for (let i = 1; i <= 10; i++) {
        await session.executeStatement(
            `UPDATE workspace.netflixdb.movies SET Price = 0 WHERE MovieID = ${i}`
        );
    }
    console.log('✅ Set MovieID 1-10 to free (Price = 0)');

    // Verify
    const query = await session.executeStatement(
        'SELECT MovieID, Title, Price FROM workspace.netflixdb.movies WHERE MovieID <= 10 ORDER BY MovieID'
    );
    const rows = await query.fetchAll();
    await query.close();
    rows.forEach(r => console.log(`  ID ${r.MovieID}: ${r.Title} — $${r.Price}`));

    await session.close();
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
