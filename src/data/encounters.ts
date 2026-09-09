/**
 * Social encounters. Each has a "tell" revealed by Listen / the Sage, and an
 * effectiveness table that changes once you have listened.
 * Effectiveness: super (x2), good (x1.4), normal (x1), weak (x0.5), backfire (negative).
 */
import type { EncounterDef } from '../engine/encounter';
import { PERSONAL } from '../config/personal';

const S = PERSONAL.sayings;

export const ENCOUNTERS: Record<string, EncounterDef> = {
  dale: {
    id: 'dale', name: 'Dale', cast: 'dale',
    title: "Booked till October. Knee hurts. Everybody wants it yesterday and paid never.",
    intro: [
      'Dale does not look up from his biscuit.',
      `Dale: "Church AC. Let me guess. Sunday."`,
      S.wwjd,
    ],
    clue: 'Dale is not mad about the AC. He is tired of being treated like an emergency. He also mentioned bass fishing four times.',
    sageAdvice: "Guys like Dale don't want vision. They want respect and a second cup. Ask about the fish.",
    effectiveness: { listen: 'good', vision: 'weak', coffee: 'good', volunteer: 'normal', boundary: 'weak', meeting: 'weak' },
    afterListen: { coffee: 'super', volunteer: 'good', vision: 'normal' },
    moves: [
      { id: 'quote', name: 'Quote a Number', text: 'Dale says a number. It has a comma in it.', energy: -6 },
      { id: 'knee', name: 'Mention His Knee', text: '"Doctor says I shouldn\'t be on ladders." He is on a ladder in his mind.', energy: -5, resolution: -4 },
      { id: 'years', name: '30 Years in the Business', text: '"I been doing this 30 years." Resistance rises like a heat index.', resist: 1 },
      { id: 'phone', name: 'Check Phone', text: 'Dale checks his phone. It is a picture of a bass.', delay: 1 },
    ],
    target: 100,
    flavor: { coffee: 'You slide a fresh cup over. Jess brewed it strong. Dale exhales for the first time today.', volunteer: '"I got a guy with a truck who can lift the unit." Dale\'s knee visibly relaxes.' },
    winText: ['Dale finishes his biscuit.', 'Dale: "Alright. I\'ll come look at it. Let\'s talk options."'],
    loseText: ['Dale: "I\'ll call you." He will not call you.'],
  },

  crowd: {
    id: 'crowd', name: 'The Back Row', cast: 'crowd',
    title: 'It is 94 degrees. The sermon is on Hell. This feels pointed.',
    intro: [
      'Twelve box fans roar like a small airport.',
      'The back row has opinions and paper bulletins folded into fans.',
    ],
    clue: 'They are not mad. They are hot. Nobody wants hot coffee. Everybody wants someone to say the quiet part: "this is bad and we will fix it."',
    sageAdvice: "Name the heat. Get bodies moving fans around. Do NOT offer coffee to sweaty people. Trust me.",
    effectiveness: { listen: 'good', vision: 'good', coffee: 'backfire', volunteer: 'good', boundary: 'weak', meeting: 'weak' },
    afterListen: { volunteer: 'super', vision: 'good' },
    moves: [
      { id: 'fan', name: 'Fan With Bulletin', text: 'A synchronized fanning begins. It is almost worship.', energy: -4 },
      { id: 'leave', name: 'Leave Early', text: 'Two families "have a thing." The thing is air conditioning.', morale: -2, resolution: -5 },
      { id: 'ask', name: 'Ask If AC Is Fixed', text: '"Is the AC fixed?" Loudly. During the offering.', energy: -6 },
    ],
    target: 80,
    flavor: { volunteer: 'Big Ronnie repositions the fans with the precision of a man who has stood in a lot of hot garages.' },
    winText: ['The back row nods. Someone says "we\'ve had worse." Someone else says "have we?"', 'You made it through. Sweaty, but through.'],
    loseText: ['The sermon ends early. So does the service. Nobody is mad. Everyone is damp.'],
  },

  thread: {
    id: 'thread', name: 'The Email Thread', cast: 'thread',
    title: '47 emails. 12 people. 3 subject lines. Zero decisions.',
    intro: [
      'Subject: RE: RE: FWD: RE: the BENCH (please read all)',
      'The thread has achieved sentience. It is Reply-All-ing itself.',
      S.wwjd,
    ],
    clue: 'Under the caps lock, people are scared the church forgot their families. Nobody actually wants 48 emails. They want one honest answer, said out loud.',
    sageAdvice: "Never fight an email thread inside the email thread. Set a boundary, then get real humans in one room.",
    effectiveness: { listen: 'good', vision: 'weak', coffee: 'weak', volunteer: 'weak', boundary: 'super', meeting: 'good' },
    afterListen: { vision: 'super', boundary: 'super', meeting: 'good' },
    moves: [
      { id: 'replyall', name: 'Reply All', text: 'Twelve phones buzz at once across Clarksville. A deacon drops his fork.', morale: -3 },
      { id: 'anon', name: 'Anonymous Email', text: '"A concerned member" (it is Harold) has concerns.', energy: -12 },
      { id: '2019', name: 'Bring Up 2019', text: '"This is just like the Easter lily situation." It is not.', resolution: -8 },
      { id: 'sub', name: "Let's Form a Subcommittee", text: 'A subcommittee is proposed. To study the bench. Which is a bench.', delay: 1 },
    ],
    target: 100,
    flavor: { boundary: 'You reply once: "I\'m taking this offline. Coffee, Thursday, my treat. Please stop replying all." Then you mute the thread. Angels sing.', vision: 'You write three honest sentences about honoring people who built this church. No caps lock. It lands.' },
    winText: ['The thread goes quiet.', 'One final email arrives: "ok." It is from Harold. It is the most peaceful "ok" in church history.'],
    loseText: ['You wake up to 19 new emails. One is just the word "Well."'],
  },

  gary: {
    id: 'gary', name: 'Gary', cast: 'gary',
    title: 'Your people park in front of my mailbox. The mailman is a petty man.',
    intro: [
      'Gary is standing by his mailbox like it owes him money.',
      'Gary: "Sunday. 10:15. A Tahoe. Every week."',
    ],
    clue: "Gary is not mad about cars. He is mad nobody asked. He fixed the church's porch light in 2019 and nobody said thanks. He is a retired electrician.",
    sageAdvice: "Guys like Gary want a job, not an apology. Recruit him. Also, do NOT set a boundary with a man holding hedge trimmers.",
    effectiveness: { listen: 'good', vision: 'normal', coffee: 'normal', volunteer: 'good', boundary: 'backfire', meeting: 'weak' },
    afterListen: { volunteer: 'super', vision: 'good', coffee: 'good' },
    moves: [
      { id: 'hoa', name: 'Cite HOA Bylaws', text: '"Section 4. Parking." There is no HOA. Gary made a binder anyway.', resist: 1 },
      { id: 'glare', name: 'Glare Over Fence', text: 'Gary glares. The fence is not tall enough to help.', energy: -6 },
      { id: 'easter', name: 'Mention 2019 Easter', text: '"Somebody parked ON my lawn." It was a cousin. It is still a sore subject.', resolution: -6 },
      { id: 'wave', name: 'Passive-Aggressive Wave', text: 'Gary waves. With two fingers. From the wrist.', energy: -3 },
    ],
    target: 100,
    truckSolves: true,
    flavor: { volunteer: '"Gary, would you run a parking team? Cones, vests, the works. You\'d be the boss." Gary is already looking at cone prices.' },
    winText: ['Gary: "...I have cones. I have a LOT of cones."', 'Gary: "Also your porch light\'s flickering again. I\'ll look at it."'],
    loseText: ['Gary goes inside. The blinds close in a way that feels personal.'],
  },

  linda: {
    id: 'linda', name: 'Linda', cast: 'linda',
    title: 'Your church rattled my Precious Moments figurines. Twice.',
    intro: [
      'Linda has a clipboard. The clipboard has photos on it.',
      'Linda: "Praise band. 9:45 AM. Decibels."',
    ],
    clue: 'Linda lives alone. She was on the zoning board for eleven years. Nobody from the church has ever invited her to anything. The figurines are fine.',
    sageAdvice: "Linda doesn't want quiet. She wants to be included. Invite her to something with coffee. Whatever you do, don't lecture her about ordinances. She wrote them.",
    effectiveness: { listen: 'good', vision: 'good', coffee: 'good', volunteer: 'weak', boundary: 'backfire', meeting: 'normal' },
    afterListen: { coffee: 'super', vision: 'good', meeting: 'good' },
    moves: [
      { id: 'ord', name: 'Reference Ordinance 14-B', text: '"14-B, subsection 3." She recites it from memory. She wrote subsection 3.', resist: 1 },
      { id: 'photo', name: 'Show Cracked Figurine', text: 'A photo of a tiny porcelain child with a tiny crack. It is honestly a little sad.', morale: -1, resolution: -4 },
      { id: 'sigh', name: 'Sigh Loudly', text: 'A sigh that has been rehearsed.', energy: -5 },
      { id: 'nonemerg', name: 'Non-Emergency Line', text: '"I have the non-emergency number saved." As a contact. Named "Church."', resolution: -8 },
    ],
    target: 100,
    flavor: { coffee: '"Linda, we do coffee Thursdays at Third Place. I\'d love your take on the parking plan." Her clipboard lowers half an inch. Then all the way.' },
    winText: ['Linda: "...I do have thoughts on the parking plan."', 'Linda: "And I still know everyone at City Hall. For the record."'],
    loseText: ['Linda writes something on the clipboard. It is underlined.'],
  },

  bev: {
    id: 'bev', name: 'Bev (Permits)', cast: 'bev',
    title: "There is no form for 'church wrestling night.' Therefore it cannot exist.",
    intro: [
      'Bev has been at this counter since 1987. The counter was built around her.',
      'Bev: "Take a number." You are the only person here.',
    ],
    clue: 'Bev is not the enemy. Bev is the filing system. There IS a Special Event Permit, Form 12-C. You just have to ask for it by name, with the right people cc\'d.',
    sageAdvice: "Every city hall has a Form 12-C. Get the fire marshal and Bev in one conversation and it appears. Bring coffee. She's been there since seven.",
    effectiveness: { listen: 'good', vision: 'weak', coffee: 'good', volunteer: 'normal', boundary: 'weak', meeting: 'good' },
    afterListen: { meeting: 'super', coffee: 'super', volunteer: 'good' },
    moves: [
      { id: 'never', name: "We've Never Done It That Way", text: '"We have never done it that way." The words echo off the marble.', resist: 2 },
      { id: 'sub', name: "Let's Form a Subcommittee", text: 'Bev suggests the Special Events Review Subcommittee. It meets quarterly. It last met in 2016.', delay: 2 },
      { id: 'number', name: 'Take a Number', text: 'You take a number. It is 41. The sign says "now serving 12."', energy: -8 },
      { id: 'lunch', name: 'Lunch Break', text: 'Bev flips a sign that says BACK IN 15. It is 10:20.', resolution: -5 },
    ],
    target: 100,
    flavor: { meeting: '"Bev, could we get the fire marshal on the phone and pull Form 12-C together?" Bev blinks. "...Nobody ever asks for it by name." A drawer opens.' },
    winText: ['Bev stamps something. The stamp says APPROVED. It has not been used in years. It still works.', 'Bev: "Wrestling. At a church." A tiny smile. "My late husband would have loved that."'],
    loseText: ['Bev: "Come back with the form." Which form? "The form."'],
  },

  form: {
    id: 'form', name: 'The Grant Form', cast: 'form',
    title: 'Section 12(b) requires a Form B. Form B does not exist.',
    intro: [
      'The Community Development Grant Application is 47 pages.',
      'Page 1 asks for your name. Page 2 asks for it again, but notarized.',
      S.wwjd,
    ],
    clue: 'The form wants numbers, not vision. Budgets, attendance counts, a line-item plan. Every "explain your dream" answer scores zero. Marcus has a spreadsheet for this.',
    sageAdvice: "Grants don't want a sermon. They want a spreadsheet with your name on it. Call a meeting with your numbers person and let them drive.",
    effectiveness: { listen: 'good', vision: 'backfire', coffee: 'weak', volunteer: 'normal', boundary: 'normal', meeting: 'good' },
    afterListen: { meeting: 'super', volunteer: 'good', boundary: 'good' },
    moves: [
      { id: 'notary', name: 'Requires Notarization', text: 'This page requires a notary. The notary is at lunch. The notary is Bev.', energy: -10 },
      { id: 'formb', name: 'Attach Form B', text: '"Please attach Form B." Form B is a rumor.', delay: 1 },
      { id: '12b', name: 'Section 12(b)', text: 'Section 12(b) references Section 12(a). Section 12(a) references 12(b).', resolution: -8 },
      { id: 'p31', name: 'Page 31 vs Page 4', text: 'Page 31 contradicts page 4. Both are mandatory.', resist: 1 },
    ],
    target: 100,
    flavor: { meeting: 'You call Marcus. He arrives in nine minutes with a laptop and the expression of a man who has been waiting his whole life for this form.', boundary: 'You write "N/A - see attached" and attach a single clean page. It is the most powerful sentence in government.' },
    winText: ['The form is complete. All 47 pages. Marcus is glowing.', 'Paulette: "Honey, nobody finishes this one. I\'ll walk it over myself."'],
    loseText: ['You have a paper cut and no Form B. The form has won today.'],
  },

  whitlock: {
    id: 'whitlock', name: 'Mr. Whitlock', cast: 'whitlock',
    title: "I'd like to help. I'd also like a restroom named after my family.",
    intro: [
      'Mr. Whitlock owns three car washes and a boat named "Liquid Assets."',
      'Whitlock: "Pastor. I\'ve been thinking about legacy."',
    ],
    clue: 'His mother played piano at a country church for forty years and nobody remembers her name. He does not actually want a restroom. He wants her remembered.',
    sageAdvice: "Rich guys who joke about naming rights are usually protecting something tender. Ask about his mother. Then tell him where the piano goes.",
    effectiveness: { listen: 'good', vision: 'normal', coffee: 'normal', volunteer: 'weak', boundary: 'normal', meeting: 'weak' },
    afterListen: { vision: 'super', boundary: 'good', coffee: 'good' },
    moves: [
      { id: 'boat', name: 'Mention His Boat', text: '"You ever been out on Liquid Assets?" You have not. It becomes a twenty-minute story.', energy: -6 },
      { id: 'roi', name: 'Ask About the ROI', text: '"What\'s the return on a church, really?" He is half joking. Half.', resolution: -6 },
      { id: 'other', name: 'Name-Drop Other Church', text: '"First Presbyterian named a whole wing after a guy." He watches your face.', morale: -2, resolution: -4 },
      { id: 'time', name: 'Check the Time', text: 'He checks a watch that costs more than your truck.', energy: -4 },
    ],
    target: 100,
    flavor: { vision: '"Picture a music room. A real piano. A plaque with her name. Kids learning on it every Wednesday." He goes very quiet.', boundary: '"We don\'t name restrooms. We do name music rooms." He laughs. He needed to laugh.' },
    winText: ['Whitlock takes out a checkbook. An actual paper checkbook.', 'Whitlock: "Her name was Dorothy. Put it somewhere with a window."'],
    loseText: ['Whitlock: "Let me think on it." He orders a scone. The scone is thinking on it too.'],
  },

  doug: {
    id: 'doug', name: 'Elder Doug', cast: 'doug',
    title: "New building? We haven't even fixed the stain. Also, can the new guys bench?",
    intro: [
      'Elder Doug has arranged the chairs in a circle. A tight circle.',
      `Doug: "Before we talk buildings. ${S.bench300}"`,
      S.wwjd,
    ],
    clue: 'Doug is scared of being unnecessary once things get nice. He built the coffee counter with his hands. Give him a job and he will carry the whole building.',
    sageAdvice: "Doug doesn't need convincing. He needs a title. Head of the build team. Say it out loud and watch him stand up straighter.",
    effectiveness: { listen: 'good', vision: 'good', coffee: 'normal', volunteer: 'good', boundary: 'weak', meeting: 'normal' },
    afterListen: { volunteer: 'super', vision: 'super' },
    moves: [
      { id: 'bench', name: 'Bench Press Reference', text: '"Marcus, what do you bench?" Marcus does not bench. Marcus has a Fitbit.', energy: -6 },
      { id: 'never', name: "We've Never Done It That Way", text: '"We\'ve always met in the warehouse." It has been four years.', resist: 1 },
      { id: 'stain', name: 'Bring Up the Stain', text: 'Everyone looks up at the stain. It looks back.', resolution: -6 },
      { id: 'anon', name: 'Anonymous Email', text: 'Someone sent an anonymous email. It is signed "Doug."', energy: -8 },
    ],
    target: 100,
    flavor: { volunteer: '"Doug. I need a head of the build team. Someone who can move a wall and a committee." Doug stands. Doug is already standing. He stands more.' },
    winText: ['Doug: "Alright. Vision\'s good. I\'m in."', 'Doug: "For the record, I can still bench 300."  Nobody asked. Everybody believed him.'],
    loseText: ['Doug: "Let\'s table it." He puts the chairs back. Loudly.'],
  },

  marcus: {
    id: 'marcus', name: 'Elder Marcus & The City', cast: 'marcus',
    title: 'The numbers must number. The city must city.',
    intro: [
      'Marcus opens a laptop. The laptop opens a spreadsheet. The spreadsheet has tabs.',
      'Marcus: "I have questions. They are numbered."',
    ],
    clue: 'He needs a plan he can defend to the bank and the zoning board, not a sermon. He has already done the math. He wants you to look at it with him.',
    sageAdvice: "Marcus is your friend. Sit next to him, not across from him. Call a real meeting and let him present. Then bring a neighbor who knows the zoning board.",
    effectiveness: { listen: 'good', vision: 'weak', coffee: 'good', volunteer: 'normal', boundary: 'normal', meeting: 'good' },
    afterListen: { meeting: 'super', volunteer: 'good', vision: 'normal' },
    moves: [
      { id: 'bylaws', name: 'Cite the Bylaws', text: 'Article 7 requires a two-thirds vote. There are three elders. Nobody knows what two-thirds of three feels like.', resist: 1 },
      { id: 'sheet', name: 'Pull Up a Spreadsheet', text: 'Tab 14: "Worst Case." It is very red.', resolution: -5 },
      { id: 'sub', name: "Let's Form a Subcommittee", text: '"A finance subcommittee could look into this." The subcommittee would be Marcus. Alone. Again.', delay: 1 },
      { id: 'zoning', name: 'Zoning Question', text: '"Is the lot even zoned for assembly?" A silence you could park in.', energy: -8 },
    ],
    target: 100,
    flavor: { meeting: 'You call a meeting with an agenda and a printed budget. Marcus looks at you like you just learned his love language.' },
    winText: ['Marcus closes the laptop. Gently.', 'Marcus: "The numbers number. We can do this. Either way."'],
    loseText: ['Marcus: "Let\'s revisit next quarter." He adds a tab called "Next Quarter."'],
  },

  carpet: {
    id: 'carpet', name: 'The Carpet Question', cast: 'carpet',
    title: 'Burgundy or sage. This decides the next 40 years.',
    intro: [
      'Elder Janet places two carpet samples on the table like evidence.',
      'Janet: "We need to talk about carpet. Everyone has feelings. Everyone."',
      S.wwjd,
    ],
    clue: 'Nobody actually cares about carpet. Everyone cares about being heard about carpet. Give them ninety seconds each, then make the call and move on.',
    sageAdvice: "The carpet is never about the carpet. Let everyone say their piece once, set a boundary, and pick one. Nobody will remember the color. They'll remember that it ended.",
    effectiveness: { listen: 'good', vision: 'weak', coffee: 'good', volunteer: 'weak', boundary: 'good', meeting: 'good' },
    afterListen: { boundary: 'super', meeting: 'good', coffee: 'good' },
    moves: [
      { id: 'swatch', name: 'Reply All With Swatches', text: 'Janet emails 14 swatches to the whole church. Someone replies "love it!" without saying which.', morale: -3 },
      { id: '1997', name: 'Cite 1997 Carpet Precedent', text: '"In 1997 the old church chose burgundy and it was fine." Nobody here was there. Everyone nods.', resist: 1 },
      { id: 'sub', name: "Let's Form a Subcommittee", text: 'The Carpet Subcommittee is proposed. It would have a chair. The chair would need carpet.', delay: 2 },
      { id: 'anon', name: 'Anonymous Email', text: '"Some of us feel sage is a fad." Signed, "some of us."', energy: -10 },
    ],
    target: 100,
    flavor: { boundary: '"Ninety seconds each. Then I pick, and we never speak of carpet again." The room exhales. Janet writes "90 sec" and underlines it.' },
    winText: ['The carpet question is settled. Nobody is sure which color won. Everyone is relieved.', 'Janet: "That was... efficient. I hated it. Thank you."'],
    loseText: ['The meeting ends with three colors and no carpet. Janet schedules a follow-up. It has a Doodle poll.'],
  },

  masked: {
    id: 'masked', name: 'The Masked Deacon', cast: 'ronnie',
    title: 'Someone has to lose this match. He brought a chair.',
    music: 'wrestling',
    intro: [
      `${PERSONAL.wrestlingEventName}! The warehouse is packed. The ring is borrowed. The lights are Christmas lights.`,
      'The Masked Deacon enters to organ music. The crowd goes wild. Linda is doing the wave.',
      `${PERSONAL.heroNickname}: "${S.violence}"`,
    ],
    clue: 'Under the mask it is obviously Ronnie. He wants the crowd to have the best night of their year. Give the people a show, then a moment.',
    sageAdvice: "It's Ronnie. Let him win the crowd, then win the moment. Tag in a volunteer, cut a promo about the building fund, and finish with a hug. Kayfabe, brother.",
    effectiveness: { listen: 'good', vision: 'good', coffee: 'weak', volunteer: 'good', boundary: 'good', meeting: 'weak' },
    afterListen: { volunteer: 'super', vision: 'super', boundary: 'good' },
    moves: [
      { id: 'chair', name: 'Steel Chair (Foam)', text: 'A steel chair! It is foam. It still stings emotionally.', energy: -10 },
      { id: 'chant', name: 'Crowd Chants His Name', text: '"DEA-CON! DEA-CON!" The kids started it. The elders joined.', resolution: -6 },
      { id: 'rope', name: 'Rope-A-Dope', text: 'He leans on the ropes. The ropes are ratchet straps. Resistance rises.', resist: 1 },
      { id: 'rules', name: 'Cite the Rulebook', text: '"That\'s illegal!" There is no rulebook. There is a bulletin.', energy: -4 },
    ],
    target: 100,
    flavor: { volunteer: 'You tag in a volunteer! It is Kyle, with a folding chair (foam) and the wild eyes of a sound guy finally seen.', vision: 'You grab the mic and cut a promo about a building where nobody has to bring a bucket for the ceiling. The crowd LOSES IT.', boundary: 'You set a boundary. With a very gentle, fully rehearsed suplex.' },
    winText: ['ONE! TWO! THREE! The bell (a triangle from the kitchen) rings!', 'The Masked Deacon rises, unmasks, and hugs you. It is Ronnie. Everyone knew. Everyone cheers anyway.'],
    loseText: ['The Masked Deacon wins by pinfall. The crowd chants for a rematch. Ronnie, still masked, gives you a thumbs up.'],
  },
};
