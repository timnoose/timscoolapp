import { startServer, openGame } from './harness.mjs';
const server = await startServer();
try {
  const g = await openGame();
  await g.shot('01-title');
  await g.press('Space'); // new game
  await g.page.waitForTimeout(1200);
  await g.shot('02-office-intro');
  await g.skipDialogue();
  await g.shot('03-office');
  console.log('world', await g.world(), 'ui', await g.ui());
  // walk up to the desk and interact
  await g.press('ArrowUp'); await g.page.waitForTimeout(200);
  await g.press('Space'); await g.page.waitForTimeout(500);
  await g.shot('04-desk');
  await g.skipDialogue();
  console.log('state.quests', (await g.state()).quests);
  // walk down out of the office
  await g.hold('ArrowDown', 900);
  await g.page.waitForTimeout(900);
  console.log('world', await g.world());
  await g.shot('05-church');
  await g.skipDialogue();
  await g.hold('ArrowDown', 2600);
  await g.page.waitForTimeout(300);
  await g.shot('06-church-walk');
  console.log('world', await g.world());
  console.log('errors', g.errors);
  await g.close();
} finally { server.kill(); }
