/**
 * Maps. Coordinates are in tiles (16px). See src/engine/mapdef.ts for the helpers.
 * Tile names come from src/art/tiles.ts. NPC ids from src/data/cast.ts.
 * Dialogue keys resolve through src/data/dialogue.ts (TALK / INTERACT tables).
 */
import { MapBuilder, type MapDef } from '../engine/mapdef';

// ------------------------------------------------------------------
// TOWN (50 x 40)
// ------------------------------------------------------------------
function buildTown(): MapDef {
  const m = new MapBuilder('town', 'Clarksville', 50, 40, 'grass', 'town');
  // texture variety
  for (let y = 0; y < 40; y++) for (let x = 0; x < 50; x++) {
    if ((x * 7 + y * 13) % 11 === 0) m.g(x, y, 'grass2');
  }
  // borders of trees
  for (let x = 0; x < 50; x++) { m.o(x, 0, 'tree'); m.o(x, 39, 'tree'); }
  for (let y = 0; y < 40; y++) { m.o(0, y, 'tree'); m.o(49, y, 'tree'); }

  // Roads: vertical at x=12..14 (line at 13), horizontal at y=17..19 (line at 18)
  m.rect(11, 1, 1, 38, 'sidewalk').rect(15, 1, 1, 38, 'sidewalk');
  m.rect(12, 1, 3, 38, 'road');
  for (let y = 1; y < 39; y++) m.g(13, y, 'roadLineV');
  m.rect(1, 16, 48, 1, 'sidewalk').rect(1, 20, 48, 1, 'sidewalk');
  m.rect(1, 17, 48, 3, 'road');
  for (let x = 1; x < 49; x++) m.g(x, 18, 'roadLineH');
  m.rect(12, 17, 3, 3, 'road'); // intersection plain
  // road exits blocked by trees at edges already; remove trees over road ends for a nicer look
  m.o(0, 17, 'bush').o(0, 18, 'bush').o(0, 19, 'bush').o(49, 17, 'bush').o(49, 18, 'bush').o(49, 19, 'bush');
  m.o(12, 0, 'bush').o(13, 0, 'bush').o(14, 0, 'bush').o(12, 39, 'bush').o(13, 39, 'bush').o(14, 39, 'bush');

  // ---------------- Warehouse church ----------------
  // main body x=18..31, y=22..26
  m.rect(18, 22, 14, 2, 'whRoof');
  m.rect(18, 24, 14, 1, 'whRoofEdge');
  m.rect(18, 25, 14, 1, 'whSiding');
  m.rect(18, 26, 14, 1, 'whSidingBase');
  [24, 27, 30].forEach((x) => m.g(x, 25, 'whSidingWindow'));
  // entrance: x=18..22, gable over the siding row, then stone + doors
  m.stamp(18, 25, ['gableL gableM gableLogo gableM gableR'], 'o');
  m.stamp(18, 26, ['column stone churchSign churchSign column']);
  m.stamp(18, 27, ['column stoneBase glassDoorL glassDoorR column']);
  m.door(20, 27, 'church', 22, 17, 'up');
  m.door(21, 27, 'church', 23, 17, 'up');
  m.interact(20, 26, 'churchSign', 'Sign');
  m.interact(21, 26, 'churchSign', 'Sign');
  // sidewalk in front + parking lot
  m.rect(16, 28, 18, 1, 'sidewalk');
  m.rect(16, 29, 18, 6, 'parking');
  for (let x = 17; x <= 33; x += 2) { m.g(x, 33, 'parkingLineV'); m.g(x, 34, 'parkingLineV'); }
  m.scatter('parkingCrack', [[18, 30], [26, 31], [30, 33], [22, 34], [17, 31]], 'g');
  m.scatter('parkingCrack', [[24, 29]], 'g');
  m.o(25, 32, 'lamp');
  m.o(30, 30, 'trailerL').o(31, 30, 'trailerR');
  m.interact(30, 30, 'trailer', 'Trailer').interact(31, 30, 'trailer', 'Trailer');
  // Ronnie's truck
  m.o(27, 30, 'truckL').o(28, 30, 'truckR');
  m.interact(27, 30, 'truck', 'Truck').interact(28, 30, 'truck', 'Truck');
  // side yard: pine, AC, dumpster, moved memorial bench
  m.o(33, 24, 'pineTop').o(33, 25, 'pineBottom');
  m.o(32, 26, 'acUnit');
  m.interact(32, 26, 'acUnit', 'AC Unit');
  m.o(33, 27, 'dumpster');
  m.interact(33, 27, 'dumpster', 'Dumpster');
  m.o(34, 27, 'memorialBench');
  m.interact(34, 27, 'memorialBench', 'Bench');
  // old garden spot (where the bench used to be)
  m.g(16, 26, 'flowers').g(17, 26, 'flowers').g(16, 27, 'flowers').g(17, 27, 'dirt');
  m.interact(17, 27, 'benchSpot', 'Bare Patch');
  m.o(16, 25, 'bush').o(17, 25, 'bush');
  // church street sign
  m.o(16, 30, 'signPost');
  m.interact(16, 30, 'churchStreetSign', 'Sign');

  // ---------------- Apartments ----------------
  m.rect(36, 21, 8, 1, 'aptRoof');
  m.rect(36, 22, 8, 3, 'aptWall');
  m.rect(36, 25, 8, 1, 'sidewalk');
  m.o(44, 23, 'bush').o(35, 23, 'bush');
  m.interact(39, 24, 'aptSign', 'Apartments');

  // ---------------- Gary's house (west of road) ----------------
  m.stamp(3, 22, [
    'roofGray roofGray roofGray roofGray roofGray roofGray',
    'roofEdgeGray roofEdgeGray roofEdgeGray roofEdgeGray roofEdgeGray roofEdgeGray',
    'houseCream window houseCream houseCream window houseCream',
    'houseCream window doorWood houseCream window houseCream',
  ]);
  m.rect(5, 26, 1, 1, 'dirt').rect(5, 27, 1, 1, 'dirt');
  m.rect(5, 27, 5, 1, 'dirt');
  m.o(9, 26, 'mailbox');
  m.interact(9, 26, 'garyMailbox', 'Mailbox');
  m.interact(5, 25, 'garyDoor', 'Door');
  for (let x = 2; x <= 9; x++) if (x !== 5) m.o(x, 29, 'fenceH');
  m.o(2, 22, 'tree').o(9, 22, 'bush').o(2, 27, 'bush');

  // ---------------- Linda's house (east of the lot) ----------------
  m.stamp(37, 29, [
    'roofBrown roofBrown roofBrown roofBrown roofBrown roofBrown',
    'roofEdgeBrown roofEdgeBrown roofEdgeBrown roofEdgeBrown roofEdgeBrown roofEdgeBrown',
    'houseBlue windowBlue houseBlue houseBlue windowBlue houseBlue',
    'houseBlue windowBlue doorWoodBlue houseBlue windowBlue houseBlue',
  ]);
  m.interact(39, 32, 'lindaDoor', 'Door');
  m.rect(39, 33, 1, 3, 'dirt');
  for (let y = 29; y <= 35; y++) m.o(35, y, 'fenceV');
  m.g(36, 34, 'flowers').g(37, 34, 'flowers').g(41, 34, 'flowers').g(42, 34, 'flowers');
  m.o(43, 30, 'tree').o(36, 36, 'bush').o(42, 36, 'bush');

  // ---------------- Mrs. Pruitt's house (north-west) ----------------
  m.stamp(3, 7, [
    'roofRed roofRed roofRed roofRed roofRed roofRed',
    'roofEdgeGrayWhite roofEdgeGrayWhite roofEdgeGrayWhite roofEdgeGrayWhite roofEdgeGrayWhite roofEdgeGrayWhite',
    'houseWhite windowWhite houseWhite houseWhite windowWhite houseWhite',
    'houseWhite windowWhite doorWhite houseWhite windowWhite houseWhite',
  ]);
  m.interact(5, 10, 'pruittDoor', 'Door');
  m.rect(5, 11, 1, 5, 'dirt');
  m.g(3, 12, 'flowers').g(4, 12, 'flowers').g(6, 12, 'flowers').g(7, 12, 'flowers');
  m.o(2, 6, 'tree').o(9, 6, 'tree').o(3, 14, 'bush').o(8, 14, 'bush');
  m.o(8, 11, 'flowerBed').o(2, 11, 'flowerBed');

  // ---------------- Coffee shop ----------------
  m.stamp(18, 12, [
    'roofRed roofRed roofRed roofRed roofRed roofRed roofRed',
    'roofEdgeRed roofEdgeRed roofEdgeRed roofEdgeRed roofEdgeRed roofEdgeRed roofEdgeRed',
    'brick shopSign shopSign shopSign brick windowBrick brick',
    'brick windowBrick awning doorShop awning windowBrick brick',
  ]);
  m.door(21, 15, 'coffee', 7, 10, 'up');
  m.interact(19, 14, 'coffeeSign', 'Sign').interact(20, 14, 'coffeeSign', 'Sign').interact(21, 14, 'coffeeSign', 'Sign');
  m.o(17, 15, 'bush').o(25, 15, 'bush').o(17, 12, 'tree').o(25, 12, 'tree');
  m.o(24, 16, 'bench');

  // ---------------- City Hall ----------------
  m.stamp(31, 11, [
    'cityRoof cityRoof cityRoof cityRoof cityRoof cityRoof cityRoof cityRoof cityRoof',
    'cityWindow cityWall cityWindow cityWall citySign cityWall cityWindow cityWall cityWindow',
    'cityWall cityWindow cityWall cityWall cityWall cityWall cityWall cityWindow cityWall',
    'cityColumn cityWindow cityColumn cityWall cityWall cityWall cityColumn cityWindow cityColumn',
    'cityColumn cityWall cityColumn cityWall cityDoor cityWall cityColumn cityWall cityColumn',
  ]);
  m.door(35, 15, 'cityhall', 9, 10, 'up');
  m.interact(35, 12, 'citySign', 'Sign');
  m.rect(30, 15, 1, 1, 'sidewalk').rect(40, 15, 1, 1, 'sidewalk');
  m.o(30, 14, 'flagPole');
  m.g(30, 14, 'sidewalk');
  m.o(40, 14, 'flowerBed').o(29, 14, 'bush').o(41, 14, 'bush');
  m.o(28, 12, 'tree').o(42, 12, 'tree');

  // ---------------- Historic chapel (for sale) ----------------
  m.o(44, 2, 'steepleTop').o(44, 3, 'steepleBase');
  m.stamp(42, 4, [
    'roofGray roofGray roofGray roofGray roofGray roofGray',
    'roofEdgeGrayBrick roofEdgeGrayBrick roofEdgeGrayBrick roofEdgeGrayBrick roofEdgeGrayBrick roofEdgeGrayBrick',
    'chapelBrick chapelWindow chapelBrick chapelBrick chapelWindow chapelBrick',
    'chapelBrick chapelWindow chapelBrick chapelDoor chapelWindow chapelBrick',
  ]);
  m.interact(45, 7, 'chapelDoor', 'Chapel Door');
  m.rect(45, 8, 1, 8, 'gardenPath');
  m.o(43, 8, 'forSaleSign');
  m.interact(43, 8, 'forSale', 'Sign');
  m.o(42, 9, 'flowerBed').o(47, 8, 'flowerBed').o(41, 5, 'tree').o(48, 6, 'tree').o(47, 10, 'tree').o(43, 11, 'bush');
  m.g(44, 9, 'flowers').g(46, 9, 'flowers');

  // ---------------- Empty lot (build site) ----------------
  m.rect(37, 34, 10, 4, 'dirt');
  for (let y = 34; y < 38; y++) for (let x = 37; x < 47; x++) if ((x + y) % 3 === 0) m.g(x, y, 'grass');
  m.o(41, 33, 'lotSign');
  m.interact(41, 33, 'lotSign', 'Sign');
  m.o(46, 33, 'bush').o(37, 38, 'bush').o(45, 38, 'tree');

  // ---------------- Park ----------------
  m.rect(17, 2, 9, 8, 'grass');
  m.o(17, 2, 'tree').o(19, 2, 'tree').o(21, 2, 'tree').o(23, 2, 'tree').o(25, 2, 'tree');
  m.o(17, 5, 'tree').o(25, 5, 'tree').o(17, 8, 'tree').o(25, 8, 'tree');
  m.g(19, 4, 'flowers').g(23, 4, 'flowers').g(19, 8, 'flowers').g(23, 8, 'flowers');
  m.o(21, 5, 'bench');
  m.interact(21, 5, 'parkBench', 'Bench');
  m.o(21, 9, 'signPost');
  m.interact(21, 9, 'townSign', 'Sign');
  m.rect(21, 10, 1, 6, 'dirt');
  m.rect(16, 10, 1, 1, 'dirt');
  // paths from sidewalks
  m.rect(16, 28, 1, 1, 'sidewalk');

  // stray trees
  m.scatter('tree', [[28, 3], [30, 5], [33, 3], [36, 7], [38, 4], [8, 3]]);
  m.scatter('tree', [[3, 33], [6, 36], [30, 37], [24, 37], [20, 37]]);
  m.scatter('bush', [[9, 33], [3, 31], [34, 37], [45, 26], [46, 28]]);
  m.scatter('flowers', [[7, 34], [28, 36], [45, 20], [9, 9]], 'g');

  // ---------------- NPCs ----------------
  m.npc({ id: 'ronnie', x: 26, y: 31, dir: 'left', dialogue: 'ronnie' });
  m.npc({ id: 'gary', x: 7, y: 27, dir: 'right', dialogue: 'gary' });
  m.npc({ id: 'linda', x: 40, y: 34, dir: 'left', dialogue: 'linda' });
  m.npc({ id: 'tonya', x: 39, y: 26, dir: 'down', dialogue: 'tonya' });
  m.npc({ id: 'pruitt', x: 6, y: 13, dir: 'down', dialogue: 'pruitt' });
  m.npc({ id: 'mason', x: 22, y: 31, dir: 'down', dialogue: 'mason', wander: true });
  m.npc({ id: 'dennis', x: 22, y: 6, dir: 'left', dialogue: 'dennis' });
  m.npc({ id: 'brenda', x: 44, y: 10, dir: 'down', dialogue: 'brenda' });
  m.npc({ id: 'hank', x: 40, y: 36, dir: 'up', dialogue: 'hank' });
  m.npc({ id: 'member1', x: 23, y: 20, dir: 'down', dialogue: 'member1', wander: true });
  m.npc({ id: 'reyes', x: 29, y: 28, dir: 'down', dialogue: 'reyes' });
  return m.build();
}

// ------------------------------------------------------------------
// WAREHOUSE CHURCH INTERIOR (26 x 20)
// ------------------------------------------------------------------
function buildChurch(): MapDef {
  const m = new MapBuilder('church', 'Harvest (The Warehouse)', 26, 20, 'carpet', 'church', true);
  m.rect(0, 0, 26, 1, 'wallTop').rect(0, 1, 26, 1, 'wallWainscot');
  m.rect(0, 2, 1, 18, 'wallSide').rect(25, 2, 1, 18, 'wallSide');
  m.rect(1, 19, 24, 1, 'wallDark');
  // office door on the top wall, TV, thermostat
  m.g(3, 1, 'officeDoor');
  m.door(3, 1, 'office', 4, 5, 'up');
  m.g(13, 1, 'tvWall');
  m.interact(13, 1, 'tv', 'TV');
  m.g(22, 1, 'thermostat');
  m.interact(22, 1, 'thermostat', 'Thermostat');
  m.g(8, 1, 'bulletin');
  m.interact(8, 1, 'kidsBoard', 'Harvest Kids Board');
  // stage + pulpit
  m.rect(5, 2, 16, 1, 'stage');
  m.g(12, 2, 'pulpit');
  m.interact(12, 2, 'pulpit', 'Pulpit');
  m.interact(13, 2, 'pulpit', 'Pulpit');
  // drapes down the sides
  for (let y = 2; y <= 12; y++) { m.o(1, y, 'drape'); m.o(24, y, 'drape'); }
  // chairs
  for (const y of [5, 7, 9, 11]) {
    for (const x of [4, 6, 8]) m.o(x, y, 'chairRow');
    for (const x of [15, 17, 19]) m.o(x, y, 'chairRow');
  }
  for (const y of [5, 7, 9, 11]) m.interact(8, y, 'chairs', 'Chairs');
  // coffee station back-left
  m.stamp(2, 15, ['counterL counterCoffee counterR'], 'o');
  m.interact(3, 15, 'churchCoffee', 'Coffee');
  m.interact(2, 15, 'churchCoffee', 'Coffee');
  m.interact(4, 15, 'churchCoffee', 'Coffee');
  // sound booth back-center
  m.o(11, 15, 'laptopTable').o(12, 15, 'soundDesk').o(13, 15, 'chairSingle');
  m.interact(12, 15, 'soundboard', 'Soundboard');
  m.interact(11, 15, 'laptop', 'Laptop');
  // the ominous ceiling stain
  m.o(21, 14, 'stainBucket');
  m.interact(21, 14, 'stain', 'Bucket');
  m.o(19, 17, 'plant');
  // exit mat: the real doors are at the back right of the room
  m.g(22, 18, 'doorMat').g(23, 18, 'doorMat');
  m.door(22, 18, 'town', 20, 28, 'down');
  m.door(23, 18, 'town', 21, 28, 'down');
  // welcome table by the doors
  m.o(20, 18, 'laptopTable');
  m.interact(20, 18, 'welcomeTable', 'Welcome Table');
  // NPCs
  m.npc({ id: 'kyle', x: 13, y: 16, dir: 'up', dialogue: 'kyle' });
  m.npc({ id: 'brayden', x: 11, y: 16, dir: 'up', dialogue: 'brayden' });
  m.npc({ id: 'sam', x: 20, y: 6, dir: 'left', dialogue: 'sam', wander: true });
  m.npc({ id: 'tanya', x: 3, y: 8, dir: 'right', dialogue: 'tanya' });
  m.npc({ id: 'richard', x: 6, y: 16, dir: 'left', dialogue: 'richard' });
  m.npc({ id: 'eli', x: 16, y: 13, dir: 'down', dialogue: 'eli' });
  m.npc({ id: 'hannah', x: 18, y: 17, dir: 'right', dialogue: 'hannah' });
  m.npc({ id: 'julie', x: 24, y: 16, dir: 'left', dialogue: 'julie' });
  m.npc({ id: 'doug', x: 10, y: 4, dir: 'down', dialogue: 'doug' });
  m.npc({ id: 'marcus', x: 14, y: 4, dir: 'down', dialogue: 'marcus' });
  m.npc({ id: 'janet', x: 12, y: 6, dir: 'up', dialogue: 'janet' });
  m.npc({ id: 'member2', x: 5, y: 13, dir: 'right', dialogue: 'member2', wander: true });
  return m.build();
}

// ------------------------------------------------------------------
// PASTOR'S OFFICE (10 x 8)
// ------------------------------------------------------------------
function buildOffice(): MapDef {
  const m = new MapBuilder('office', "Pastor's Office", 10, 8, 'carpet', 'church', true);
  m.rect(0, 0, 10, 1, 'wallTop').rect(0, 1, 10, 1, 'wallWainscot');
  m.rect(0, 2, 1, 6, 'wallSide').rect(9, 2, 1, 6, 'wallSide');
  m.rect(1, 7, 8, 1, 'wallDark');
  m.g(1, 1, 'bookshelf').g(2, 1, 'bookshelf').g(7, 1, 'fileCabinet');
  m.interact(1, 1, 'bookshelf', 'Bookshelf').interact(2, 1, 'bookshelf', 'Bookshelf');
  m.interact(7, 1, 'fileCabinet', 'File Cabinet');
  m.o(4, 2, 'desk');
  m.interact(4, 2, 'desk', 'Desk');
  m.o(1, 4, 'couch').o(2, 4, 'couch');
  m.interact(1, 4, 'couch', 'Couch').interact(2, 4, 'couch', 'Couch');
  m.o(7, 4, 'benchPress');
  m.interact(7, 4, 'benchPress', 'Bench');
  m.o(8, 6, 'plant');
  m.g(4, 6, 'doorMat');
  m.door(4, 6, 'church', 3, 2, 'down');
  return m.build();
}

// ------------------------------------------------------------------
// COFFEE SHOP (16 x 12)
// ------------------------------------------------------------------
function buildCoffee(): MapDef {
  const m = new MapBuilder('coffee', 'Third Place Coffee', 16, 12, 'woodFloor', 'coffee', true);
  m.rect(0, 0, 16, 1, 'wallCream');
  m.rect(0, 1, 1, 11, 'wallSide').rect(15, 1, 1, 11, 'wallSide');
  m.rect(1, 11, 14, 1, 'wallDark');
  m.g(5, 0, 'chalkboard').g(6, 0, 'chalkboard');
  m.interact(5, 0, 'menu', 'Menu').interact(6, 0, 'menu', 'Menu');
  // counter
  m.stamp(2, 2, ['cafeCounter espresso pastryCase cafeCounter cafeCounter cafeCounter'], 'o');
  m.interact(3, 2, 'espresso', 'Espresso Machine').interact(4, 2, 'pastry', 'Pastry Case');
  // tables
  m.o(3, 6, 'cafeTable').o(2, 6, 'cafeChair').o(4, 6, 'cafeChair');
  m.o(8, 6, 'cafeTable').o(7, 6, 'cafeChair').o(9, 6, 'cafeChair');
  m.o(12, 5, 'cafeTable').o(12, 4, 'cafeChair');
  m.o(12, 9, 'cafeTable').o(11, 9, 'cafeChair');
  m.o(3, 9, 'cafeTable').o(4, 9, 'cafeChair');
  m.o(14, 1, 'plant').o(1, 10, 'plant');
  // exit
  m.g(7, 11, 'exitWood').g(8, 11, 'exitWood');
  m.door(7, 11, 'town', 21, 16, 'down');
  m.door(8, 11, 'town', 21, 16, 'down');
  // NPCs
  m.npc({ id: 'jess', x: 4, y: 1, dir: 'down', dialogue: 'jess' });
  m.npc({ id: 'tim', x: 13, y: 5, dir: 'left', dialogue: 'tim' });
  m.npc({ id: 'dale', x: 8, y: 3, dir: 'up', dialogue: 'dale' });
  m.npc({ id: 'whitlock', x: 12, y: 8, dir: 'down', dialogue: 'whitlock' });
  m.npc({ id: 'harold', x: 2, y: 9, dir: 'right', dialogue: 'harold' });
  return m.build();
}

// ------------------------------------------------------------------
// CITY HALL (18 x 12)
// ------------------------------------------------------------------
function buildCityHall(): MapDef {
  const m = new MapBuilder('cityhall', 'Clarksville City Hall', 18, 12, 'marble', 'city', true);
  m.rect(0, 0, 18, 1, 'wallCity');
  m.rect(0, 1, 1, 11, 'wallSide').rect(17, 1, 1, 11, 'wallSide');
  m.rect(1, 11, 16, 1, 'wallDark');
  m.g(3, 0, 'bulletin').g(9, 0, 'mayorPortrait');
  m.interact(3, 0, 'bulletin', 'Bulletin Board').interact(9, 0, 'mayor', 'Portrait');
  // permit counter
  m.stamp(6, 2, ['cityCounter cityCounter cityCounter cityCounter cityCounter cityCounter'], 'o');
  m.o(5, 2, 'numberDispenser');
  m.interact(5, 2, 'takeNumber', 'Take a Number');
  // waiting chairs
  m.o(2, 5, 'waitChair').o(3, 5, 'waitChair').o(4, 5, 'waitChair');
  m.o(2, 8, 'waitChair').o(3, 8, 'waitChair');
  // grants desk
  m.o(14, 3, 'grantDesk');
  m.interact(14, 3, 'grantDeskSign', 'Grants Desk');
  m.o(16, 1, 'plant').o(1, 10, 'plant').o(16, 10, 'plant');
  m.o(13, 0, 'flagPole');
  m.g(13, 0, 'wallCity');
  // exit
  m.g(8, 11, 'exitMarble').g(9, 11, 'exitMarble');
  m.door(8, 11, 'town', 35, 16, 'down');
  m.door(9, 11, 'town', 35, 16, 'down');
  // NPCs
  m.npc({ id: 'bev', x: 9, y: 1, dir: 'down', dialogue: 'bev' });
  m.npc({ id: 'paulette', x: 14, y: 2, dir: 'down', dialogue: 'paulette' });
  m.npc({ id: 'harold', x: 3, y: 6, dir: 'down', dialogue: 'haroldCity', when: 'haroldAtCityHall' });
  return m.build();
}

// ------------------------------------------------------------------
// ENDING: historic chapel interior (18 x 14)
// ------------------------------------------------------------------
function buildChapel(): MapDef {
  const m = new MapBuilder('chapel', 'Old Madison Street Chapel', 18, 14, 'warmFloor', 'ending', true);
  m.rect(0, 0, 18, 1, 'wallChapel');
  m.rect(0, 1, 1, 13, 'wallSide').rect(17, 1, 1, 13, 'wallSide');
  m.rect(1, 13, 16, 1, 'wallDark');
  [2, 5, 12, 15].forEach((x) => m.g(x, 0, 'stainedGlass'));
  m.g(8, 0, 'altar').g(9, 0, 'altar');
  m.scatter('lightPool', [[8, 3], [9, 3], [8, 7], [9, 7]], 'g');
  for (const y of [4, 6, 8, 10]) {
    for (const x of [2, 3, 4, 5, 6]) m.o(x, y, 'pew');
    for (const x of [11, 12, 13, 14, 15]) m.o(x, y, 'pew');
  }
  m.o(1, 2, 'plant').o(16, 2, 'plant');
  m.g(8, 13, 'doorMat').g(9, 13, 'doorMat');
  return m.build();
}

// ------------------------------------------------------------------
// ENDING: new campus interior (22 x 14)
// ------------------------------------------------------------------
function buildCampus(): MapDef {
  const m = new MapBuilder('campus', 'Harvest Campus', 22, 14, 'warmFloor', 'ending', true);
  m.rect(0, 0, 22, 1, 'wallCream');
  m.rect(0, 1, 1, 13, 'wallSide').rect(21, 1, 1, 13, 'wallSide');
  m.rect(1, 13, 20, 1, 'wallDark');
  [9, 10, 11, 12].forEach((x) => m.g(x, 0, 'ledWall'));
  m.rect(6, 1, 10, 1, 'stage');
  m.g(10, 1, 'pulpit');
  m.scatter('lightPool', [[5, 4], [16, 4], [10, 8], [11, 8]], 'g');
  for (const y of [4, 6, 8, 10]) {
    for (const x of [3, 5, 7]) m.o(x, y, 'chairRow');
    for (const x of [13, 15, 17]) m.o(x, y, 'chairRow');
  }
  m.stamp(2, 12, ['counterL counterCoffee counterR'], 'o');
  m.o(19, 12, 'plant').o(1, 2, 'plant').o(20, 2, 'plant');
  m.g(10, 13, 'doorMat').g(11, 13, 'doorMat');
  return m.build();
}

export const MAPS: Record<string, MapDef> = {
  town: buildTown(),
  church: buildChurch(),
  office: buildOffice(),
  coffee: buildCoffee(),
  cityhall: buildCityHall(),
  chapel: buildChapel(),
  campus: buildCampus(),
};
