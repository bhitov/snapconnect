/**
 * Test data for generating chat histories
 * Contains messages for healthy platonic, troubled platonic, and group conversations
 */

export interface MessageData {
  senderId: string;
  text: string;
  minutesAgo: number; // How many minutes ago from "now" this message was sent
}

/**
 * Healthy platonic conversation between Alex Chen and Jason Miller
 * Shows good friendship patterns: ACR, shared interests, mutual support
 */
export const healthyPlatonicMessages: MessageData[] = [
  // Starting 7 days ago
  { senderId: 'alex_chen', text: 'Hey Jason! Guess what? I just got promoted to senior developer!', minutesAgo: 10080 },
  { senderId: 'jason_miller', text: "That's AMAZING Alex! Congrats man! 🎉 You totally deserve it!", minutesAgo: 10075 },
  { senderId: 'jason_miller', text: 'How long have you been working towards this? This is huge!', minutesAgo: 10074 },
  { senderId: 'alex_chen', text: 'About 2 years! The extra responsibilities are a bit scary but I\'m excited', minutesAgo: 10070 },
  { senderId: 'jason_miller', text: 'What kind of new responsibilities? Will you be leading a team?', minutesAgo: 10065 },
  { senderId: 'alex_chen', text: 'Yeah! I\'ll be mentoring 3 junior devs and architecting our new microservices', minutesAgo: 10060 },
  { senderId: 'jason_miller', text: 'That\'s perfect for you. Remember when you helped me debug that API last month? You\'re a natural teacher', minutesAgo: 10055 },
  
  // 6 days ago - shared interest in basketball
  { senderId: 'jason_miller', text: 'Did you catch the Lakers game last night?', minutesAgo: 8640 },
  { senderId: 'alex_chen', text: 'YES! That fourth quarter was insane', minutesAgo: 8635 },
  { senderId: 'jason_miller', text: 'LeBron\'s still got it. That dunk over Gobert 😱', minutesAgo: 8630 },
  { senderId: 'alex_chen', text: 'We should go to a game sometime. I can get tickets through work', minutesAgo: 8625 },
  { senderId: 'jason_miller', text: 'Dude yes! Let me know when. I\'m free most weekends', minutesAgo: 8620 },
  { senderId: 'alex_chen', text: 'I\'ll check for the Warriors game next month. Battle of California!', minutesAgo: 8615 },
  
  // 5 days ago - Jason shares news
  { senderId: 'jason_miller', text: 'Bro I finally asked Sarah out!', minutesAgo: 7200 },
  { senderId: 'alex_chen', text: 'NO WAY! Finally! How did it go??', minutesAgo: 7195 },
  { senderId: 'jason_miller', text: 'She said yes! We\'re going to that new Italian place downtown Friday', minutesAgo: 7190 },
  { senderId: 'alex_chen', text: 'I\'m so happy for you man. You\'ve been talking about her for months', minutesAgo: 7185 },
  { senderId: 'alex_chen', text: 'What are you going to wear? Need help picking something out?', minutesAgo: 7184 },
  { senderId: 'jason_miller', text: 'Actually yeah, I\'m terrible at this stuff lol', minutesAgo: 7180 },
  { senderId: 'alex_chen', text: 'Come over tomorrow, we\'ll figure it out. I\'ll teach you my ways 😎', minutesAgo: 7175 },
  
  // 4 days ago - shared interest in gaming
  { senderId: 'alex_chen', text: 'New season of Apex dropped. You playing tonight?', minutesAgo: 5760 },
  { senderId: 'jason_miller', text: 'Is water wet? Of course I\'m playing!', minutesAgo: 5755 },
  { senderId: 'alex_chen', text: 'Haha let\'s run some ranked. I\'m almost Diamond', minutesAgo: 5750 },
  { senderId: 'jason_miller', text: 'Carry me senpai 🙏', minutesAgo: 5745 },
  { senderId: 'alex_chen', text: 'Always got your back. 8pm?', minutesAgo: 5740 },
  { senderId: 'jason_miller', text: 'Perfect. I\'ll bring my A-game', minutesAgo: 5735 },
  
  // Later that day - post gaming
  { senderId: 'jason_miller', text: 'GGs man. That last match was rough', minutesAgo: 5400 },
  { senderId: 'alex_chen', text: 'We\'ll get em next time. Your Wraith plays were sick though', minutesAgo: 5395 },
  { senderId: 'jason_miller', text: 'Thanks for not raging when I whiffed that last shot 😅', minutesAgo: 5390 },
  { senderId: 'alex_chen', text: 'Never man. It\'s just a game. Plus you clutched that 1v3 earlier', minutesAgo: 5385 },
  
  // 3 days ago - Jason supporting Alex
  { senderId: 'alex_chen', text: 'Rough day at work. Imposter syndrome hitting hard with the new role', minutesAgo: 4320 },
  { senderId: 'jason_miller', text: 'Hey, that\'s totally normal. Want to talk about it?', minutesAgo: 4315 },
  { senderId: 'alex_chen', text: 'Just feel like everyone\'s expecting me to know everything already', minutesAgo: 4310 },
  { senderId: 'jason_miller', text: 'They promoted YOU for a reason. Not someone else. Remember that', minutesAgo: 4305 },
  { senderId: 'jason_miller', text: 'When I started my job I felt the same way. It gets better, trust me', minutesAgo: 4304 },
  { senderId: 'alex_chen', text: 'Thanks man. I needed to hear that', minutesAgo: 4300 },
  { senderId: 'jason_miller', text: 'Want to grab a beer after work? My treat to celebrate your promotion properly', minutesAgo: 4295 },
  { senderId: 'alex_chen', text: 'That sounds perfect actually', minutesAgo: 4290 },
  
  // 2 days ago - shared interest in movies
  { senderId: 'jason_miller', text: 'Have you seen the new Spider-verse movie yet?', minutesAgo: 2880 },
  { senderId: 'alex_chen', text: 'Not yet! No spoilers! Is it good?', minutesAgo: 2875 },
  { senderId: 'jason_miller', text: 'It\'s INCREDIBLE. We should go this weekend', minutesAgo: 2870 },
  { senderId: 'alex_chen', text: 'Saturday matinee? Cheaper tickets', minutesAgo: 2865 },
  { senderId: 'jason_miller', text: 'Smart. Let\'s do 1pm showing?', minutesAgo: 2860 },
  { senderId: 'alex_chen', text: 'Booked! I\'ll get the tickets, you get the popcorn', minutesAgo: 2855 },
  
  // Yesterday - checking in
  { senderId: 'jason_miller', text: 'How\'d the junior dev meeting go?', minutesAgo: 1440 },
  { senderId: 'alex_chen', text: 'Actually went really well! They seem excited to learn', minutesAgo: 1435 },
  { senderId: 'jason_miller', text: 'See? You\'re a natural leader. Told you so', minutesAgo: 1430 },
  { senderId: 'alex_chen', text: 'One of them even stayed after to ask about career advice', minutesAgo: 1425 },
  { senderId: 'jason_miller', text: 'That\'s when you know you made an impact', minutesAgo: 1420 },
  
  // Yesterday evening - fitness interest
  { senderId: 'alex_chen', text: 'Hit a new PR on bench today! 225 finally', minutesAgo: 1200 },
  { senderId: 'jason_miller', text: 'TWO PLATES! Beast mode activated 💪', minutesAgo: 1195 },
  { senderId: 'jason_miller', text: 'How long have you been stuck at 205?', minutesAgo: 1194 },
  { senderId: 'alex_chen', text: 'Like 3 months. Changed my program and it worked!', minutesAgo: 1190 },
  { senderId: 'jason_miller', text: 'What program? I need to break my plateau too', minutesAgo: 1185 },
  { senderId: 'alex_chen', text: 'I\'ll send you the spreadsheet. We should lift together sometime', minutesAgo: 1180 },
  { senderId: 'jason_miller', text: 'Monday morning? Before work?', minutesAgo: 1175 },
  { senderId: 'alex_chen', text: 'If we go at 6am I\'m down', minutesAgo: 1170 },
  { senderId: 'jason_miller', text: 'Deal. I\'ll bring the pre-workout', minutesAgo: 1165 },
  
  // Today - various conversations
  { senderId: 'jason_miller', text: 'Morning! You survive the 6am workout? 😂', minutesAgo: 480 },
  { senderId: 'alex_chen', text: 'Barely. My legs are jello', minutesAgo: 475 },
  { senderId: 'jason_miller', text: 'Same. Stairs are my enemy today', minutesAgo: 470 },
  { senderId: 'alex_chen', text: 'Worth it though. Good start to the week', minutesAgo: 465 },
  
  // Talking about Jason's date
  { senderId: 'alex_chen', text: 'How was the date with Sarah??', minutesAgo: 180 },
  { senderId: 'jason_miller', text: 'It was perfect! We talked for like 3 hours', minutesAgo: 175 },
  { senderId: 'alex_chen', text: 'That\'s a great sign! Second date planned?', minutesAgo: 170 },
  { senderId: 'jason_miller', text: 'This Friday! She wants to go bowling', minutesAgo: 165 },
  { senderId: 'alex_chen', text: 'She\'s into bowling? That\'s awesome', minutesAgo: 160 },
  { senderId: 'jason_miller', text: 'Right? And she\'s actually good apparently. I\'m gonna get destroyed', minutesAgo: 155 },
  { senderId: 'alex_chen', text: 'Just have fun with it. She already likes you', minutesAgo: 150 },
  
  // Recent - planning weekend
  { senderId: 'alex_chen', text: 'Still on for Spider-verse tomorrow?', minutesAgo: 60 },
  { senderId: 'jason_miller', text: 'Absolutely! I\'ve been looking forward to it all week', minutesAgo: 55 },
  { senderId: 'alex_chen', text: 'Want to grab lunch before? That taco place?', minutesAgo: 50 },
  { senderId: 'jason_miller', text: 'You read my mind. 12pm?', minutesAgo: 45 },
  { senderId: 'alex_chen', text: 'Perfect. It\'s gonna be a good day', minutesAgo: 40 },
  { senderId: 'jason_miller', text: 'The best! Movies and tacos with my bro', minutesAgo: 35 },
  
  // Very recent
  { senderId: 'jason_miller', text: 'Thanks for always being there man', minutesAgo: 20 },
  { senderId: 'alex_chen', text: 'Always bro. That\'s what friends are for', minutesAgo: 15 },
  { senderId: 'jason_miller', text: 'Lucky to have you in my corner', minutesAgo: 10 },
  { senderId: 'alex_chen', text: 'Right back at you 👊', minutesAgo: 5 },
];

/**
 * Troubled platonic conversation between Emma Davis and Jason Miller
 * Shows poor friendship patterns: passive responses, one-sided, declining engagement
 */
export const troubledPlatonicMessages: MessageData[] = [
  // Starting 14 days ago - used to be closer
  { senderId: 'emma_davis', text: 'Hey Jason! Haven\'t talked in a while. How\'ve you been?', minutesAgo: 20160 },
  { senderId: 'jason_miller', text: 'Good. You?', minutesAgo: 20100 },
  { senderId: 'emma_davis', text: 'I\'m doing well! Just started a new job at the design agency downtown', minutesAgo: 20095 },
  { senderId: 'jason_miller', text: 'Cool', minutesAgo: 20040 },
  { senderId: 'emma_davis', text: 'Yeah it\'s been really exciting! The team is great and I\'m working on some big brands', minutesAgo: 20035 },
  { senderId: 'emma_davis', text: 'How\'s your job going?', minutesAgo: 20034 },
  { senderId: 'jason_miller', text: 'Same old', minutesAgo: 19980 },
  
  // 12 days ago - Emma trying to make plans
  { senderId: 'emma_davis', text: 'Want to grab coffee this weekend? Would love to catch up properly', minutesAgo: 17280 },
  { senderId: 'jason_miller', text: 'Maybe. I\'ll let you know', minutesAgo: 17220 },
  { senderId: 'emma_davis', text: 'OK! I\'m free Saturday afternoon or Sunday morning', minutesAgo: 17215 },
  // No response from Jason
  
  // 10 days ago - Emma following up
  { senderId: 'emma_davis', text: 'Hey, did you still want to get coffee?', minutesAgo: 14400 },
  { senderId: 'jason_miller', text: 'Oh sorry, been busy', minutesAgo: 14340 },
  { senderId: 'emma_davis', text: 'No worries! Maybe next weekend?', minutesAgo: 14335 },
  { senderId: 'jason_miller', text: 'We\'ll see', minutesAgo: 14280 },
  
  // 8 days ago - Emma sharing good news
  { senderId: 'emma_davis', text: 'Jason! I just won the design competition at work!', minutesAgo: 11520 },
  { senderId: 'jason_miller', text: 'Nice', minutesAgo: 11460 },
  { senderId: 'emma_davis', text: 'I\'m so excited! It was for a major retail brand campaign', minutesAgo: 11455 },
  { senderId: 'emma_davis', text: 'The prize is $5000 and they\'re using my design!', minutesAgo: 11454 },
  { senderId: 'jason_miller', text: 'That\'s good', minutesAgo: 11400 },
  { senderId: 'emma_davis', text: 'Thanks... I thought you\'d be more excited for me', minutesAgo: 11395 },
  { senderId: 'jason_miller', text: 'I am. Just working', minutesAgo: 11340 },
  
  // 7 days ago - trying to connect over shared interest
  { senderId: 'emma_davis', text: 'Did you see the new photography exhibition at MOMA?', minutesAgo: 10080 },
  { senderId: 'jason_miller', text: 'No', minutesAgo: 10020 },
  { senderId: 'emma_davis', text: 'I remember you used to love photography. This one has some amazing street photography', minutesAgo: 10015 },
  { senderId: 'jason_miller', text: 'Haven\'t been taking photos lately', minutesAgo: 9960 },
  { senderId: 'emma_davis', text: 'Oh... why not?', minutesAgo: 9955 },
  { senderId: 'jason_miller', text: 'Just haven\'t', minutesAgo: 9900 },
  
  // 5 days ago - Emma concerned
  { senderId: 'emma_davis', text: 'Jason is everything okay? You seem distant lately', minutesAgo: 7200 },
  { senderId: 'jason_miller', text: 'I\'m fine', minutesAgo: 7140 },
  { senderId: 'emma_davis', text: 'Are you sure? We used to talk all the time and now...', minutesAgo: 7135 },
  { senderId: 'jason_miller', text: 'People get busy Emma', minutesAgo: 7080 },
  { senderId: 'emma_davis', text: 'I know but this feels different. Did I do something wrong?', minutesAgo: 7075 },
  { senderId: 'jason_miller', text: 'No', minutesAgo: 7020 },
  { senderId: 'emma_davis', text: 'Then what is it? I miss my friend', minutesAgo: 7015 },
  // No response
  
  // 4 days ago - Jason passive aggressive
  { senderId: 'jason_miller', text: 'Saw you hanging with Alex a lot', minutesAgo: 5760 },
  { senderId: 'emma_davis', text: 'Yeah we work near each other so we get lunch sometimes', minutesAgo: 5755 },
  { senderId: 'jason_miller', text: 'Must be nice', minutesAgo: 5700 },
  { senderId: 'emma_davis', text: 'You could join us anytime! We\'d love to have you', minutesAgo: 5695 },
  { senderId: 'jason_miller', text: 'I\'m good', minutesAgo: 5640 },
  
  // 3 days ago - Emma trying again
  { senderId: 'emma_davis', text: 'There\'s a food truck festival this weekend. Remember how we used to love those?', minutesAgo: 4320 },
  { senderId: 'jason_miller', text: 'Can\'t make it', minutesAgo: 4260 },
  { senderId: 'emma_davis', text: 'You don\'t even know what day it is...', minutesAgo: 4255 },
  { senderId: 'jason_miller', text: 'Busy all weekend', minutesAgo: 4200 },
  
  // 2 days ago - Emma venting
  { senderId: 'emma_davis', text: 'Had such a stressful day. Client completely changed the brief last minute', minutesAgo: 2880 },
  { senderId: 'jason_miller', text: 'That sucks', minutesAgo: 2820 },
  { senderId: 'emma_davis', text: 'I have to redo 2 weeks of work by Monday', minutesAgo: 2815 },
  { senderId: 'emma_davis', text: 'I\'m so frustrated', minutesAgo: 2814 },
  { senderId: 'jason_miller', text: 'Yeah clients are like that', minutesAgo: 2760 },
  { senderId: 'emma_davis', text: 'Thanks for the support...', minutesAgo: 2755 },
  
  // Yesterday - Jason only texts when he needs something
  { senderId: 'jason_miller', text: 'Hey do you still have that iPad stylus I lent you?', minutesAgo: 1440 },
  { senderId: 'emma_davis', text: 'Seriously? That\'s what you text me about?', minutesAgo: 1435 },
  { senderId: 'jason_miller', text: 'I need it back', minutesAgo: 1380 },
  { senderId: 'emma_davis', text: 'You gave that to me for my birthday Jason', minutesAgo: 1375 },
  { senderId: 'jason_miller', text: 'Oh. Nvm then', minutesAgo: 1320 },
  
  // Yesterday evening - Emma making one last effort
  { senderId: 'emma_davis', text: 'Jason what happened to us? We were best friends', minutesAgo: 960 },
  { senderId: 'jason_miller', text: 'Nothing happened', minutesAgo: 900 },
  { senderId: 'emma_davis', text: 'Something clearly did. You barely respond to me anymore', minutesAgo: 895 },
  { senderId: 'jason_miller', text: 'I respond', minutesAgo: 840 },
  { senderId: 'emma_davis', text: 'With one or two words! You used to actually talk to me', minutesAgo: 835 },
  { senderId: 'jason_miller', text: 'Things change', minutesAgo: 780 },
  { senderId: 'emma_davis', text: 'But WHY did they change? What did I do?', minutesAgo: 775 },
  { senderId: 'jason_miller', text: 'You didn\'t do anything', minutesAgo: 720 },
  { senderId: 'emma_davis', text: 'Then why are you treating me like this?', minutesAgo: 715 },
  // No response
  
  // Today - minimal interaction
  { senderId: 'emma_davis', text: 'Good morning', minutesAgo: 480 },
  // No response for hours
  { senderId: 'jason_miller', text: 'Morning', minutesAgo: 240 },
  { senderId: 'emma_davis', text: 'Have a good day', minutesAgo: 235 },
  { senderId: 'jason_miller', text: 'Thanks', minutesAgo: 180 },
  
  // Recent - Emma giving up
  { senderId: 'emma_davis', text: 'I don\'t know what else to do Jason', minutesAgo: 60 },
  { senderId: 'emma_davis', text: 'I\'ve tried everything to save our friendship', minutesAgo: 59 },
  { senderId: 'emma_davis', text: 'But you clearly don\'t want to be friends anymore', minutesAgo: 58 },
  { senderId: 'emma_davis', text: 'So I\'m going to stop trying', minutesAgo: 57 },
  { senderId: 'jason_miller', text: 'If that\'s what you want', minutesAgo: 45 },
  { senderId: 'emma_davis', text: 'It\'s not what I want Jason. But I can\'t do this alone', minutesAgo: 40 },
  // No response from Jason
];

/**
 * Group conversation between Alex Chen, Jason Miller, and Emma Davis
 * Jason is somewhat of a troublemaker - dismissive, changes topics, mild negativity
 */
export const groupMessages: MessageData[] = [
  // Starting 5 days ago - planning a group hangout
  { senderId: 'alex_chen', text: 'Hey team! Who\'s free this weekend? Thinking we could do something fun', minutesAgo: 7200 },
  { senderId: 'emma_davis', text: 'I\'m free Saturday! What did you have in mind?', minutesAgo: 7195 },
  { senderId: 'jason_miller', text: 'Depends what "fun" means', minutesAgo: 7190 },
  { senderId: 'alex_chen', text: 'Maybe mini golf? Or escape room?', minutesAgo: 7185 },
  { senderId: 'emma_davis', text: 'Ooh escape room sounds awesome!', minutesAgo: 7180 },
  { senderId: 'jason_miller', text: 'Escape rooms are overpriced', minutesAgo: 7175 },
  { senderId: 'alex_chen', text: 'What would you prefer Jason?', minutesAgo: 7170 },
  { senderId: 'jason_miller', text: 'Idk. Whatever', minutesAgo: 7165 },
  { senderId: 'emma_davis', text: 'Come on Jason, help us out here', minutesAgo: 7160 },
  { senderId: 'jason_miller', text: 'Fine. Escape room I guess', minutesAgo: 7155 },
  
  // Alex being the organizer
  { senderId: 'alex_chen', text: 'Great! I\'ll book the zombie apocalypse one for Saturday 2pm', minutesAgo: 7150 },
  { senderId: 'emma_davis', text: 'Perfect! Can\'t wait 🧟‍♀️', minutesAgo: 7145 },
  { senderId: 'jason_miller', text: 'Zombies are so played out', minutesAgo: 7140 },
  { senderId: 'alex_chen', text: 'They also have a spy themed one if you prefer?', minutesAgo: 7135 },
  { senderId: 'jason_miller', text: 'Whatever you already picked is fine', minutesAgo: 7130 },
  
  // 4 days ago - Emma sharing work stuff
  { senderId: 'emma_davis', text: 'You guys!! I have huge news!', minutesAgo: 5760 },
  { senderId: 'alex_chen', text: 'What\'s up??', minutesAgo: 5755 },
  { senderId: 'emma_davis', text: 'I got promoted to Senior Designer! 🎉', minutesAgo: 5750 },
  { senderId: 'alex_chen', text: 'Emma that\'s incredible! Congratulations!', minutesAgo: 5745 },
  { senderId: 'jason_miller', text: 'Everyone\'s getting promoted except me apparently', minutesAgo: 5740 },
  { senderId: 'emma_davis', text: 'Thanks Alex! Jason your time will come', minutesAgo: 5735 },
  { senderId: 'jason_miller', text: 'Sure it will', minutesAgo: 5730 },
  { senderId: 'alex_chen', text: 'Let\'s celebrate at the escape room! Drinks after?', minutesAgo: 5725 },
  { senderId: 'emma_davis', text: 'Yes! First round\'s on me!', minutesAgo: 5720 },
  { senderId: 'jason_miller', text: 'Must be nice to have money to throw around', minutesAgo: 5715 },
  
  // Jason changing topics abruptly
  { senderId: 'jason_miller', text: 'Did anyone see that fight video going viral?', minutesAgo: 5710 },
  { senderId: 'alex_chen', text: 'No? But Emma we should toast your promotion properly!', minutesAgo: 5705 },
  { senderId: 'jason_miller', text: 'It\'s crazy. Two karens at Walmart', minutesAgo: 5700 },
  { senderId: 'emma_davis', text: 'Thanks Alex. Jason can we focus on positive stuff?', minutesAgo: 5695 },
  { senderId: 'jason_miller', text: 'Just trying to have a conversation', minutesAgo: 5690 },
  
  // 3 days ago - planning logistics
  { senderId: 'alex_chen', text: 'Escape room is booked! 2pm Saturday', minutesAgo: 4320 },
  { senderId: 'emma_davis', text: 'Awesome! Should we meet there or carpool?', minutesAgo: 4315 },
  { senderId: 'jason_miller', text: 'I\'ll just meet you there', minutesAgo: 4310 },
  { senderId: 'alex_chen', text: 'I can pick people up if needed', minutesAgo: 4305 },
  { senderId: 'emma_davis', text: 'I\'d love a ride if you\'re offering!', minutesAgo: 4300 },
  { senderId: 'jason_miller', text: 'Of course Emma needs a ride', minutesAgo: 4295 },
  { senderId: 'emma_davis', text: 'What\'s that supposed to mean?', minutesAgo: 4290 },
  { senderId: 'jason_miller', text: 'Nothing. Forget it', minutesAgo: 4285 },
  { senderId: 'alex_chen', text: 'Alright... I\'ll pick up Emma at 1:30. Jason you good to meet us there?', minutesAgo: 4280 },
  { senderId: 'jason_miller', text: 'Yeah whatever', minutesAgo: 4275 },
  
  // 2 days ago - group energy declining
  { senderId: 'emma_davis', text: 'Is it just me or has the vibe been off lately?', minutesAgo: 2880 },
  { senderId: 'alex_chen', text: 'I\'ve noticed it too. Everything okay Jason?', minutesAgo: 2875 },
  { senderId: 'jason_miller', text: 'Why is it always about me?', minutesAgo: 2870 },
  { senderId: 'emma_davis', text: 'Because you\'ve been negative about everything', minutesAgo: 2865 },
  { senderId: 'jason_miller', text: 'Sorry for having opinions', minutesAgo: 2860 },
  { senderId: 'alex_chen', text: 'It\'s not about having opinions, it\'s how you express them', minutesAgo: 2855 },
  { senderId: 'jason_miller', text: 'Great now you\'re both ganging up on me', minutesAgo: 2850 },
  { senderId: 'emma_davis', text: 'We\'re not ganging up! We\'re concerned', minutesAgo: 2845 },
  { senderId: 'jason_miller', text: 'I\'m fine. Drop it', minutesAgo: 2840 },
  
  // Yesterday - trying to lighten mood
  { senderId: 'alex_chen', text: 'Who wants to see pics from my hike yesterday? 🏔️', minutesAgo: 1440 },
  { senderId: 'emma_davis', text: 'Yes! Share them!', minutesAgo: 1435 },
  { senderId: 'alex_chen', text: '[Imagine beautiful mountain sunset photos]', minutesAgo: 1430 },
  { senderId: 'emma_davis', text: 'Wow these are gorgeous! Which trail?', minutesAgo: 1425 },
  { senderId: 'jason_miller', text: 'Must be nice to have time for hiking', minutesAgo: 1420 },
  { senderId: 'alex_chen', text: 'It was just a quick morning hike. You should join next time', minutesAgo: 1415 },
  { senderId: 'jason_miller', text: 'I\'m good', minutesAgo: 1410 },
  
  // Emma trying to be positive
  { senderId: 'emma_davis', text: 'I\'m excited for tomorrow! Been too long since we all hung out', minutesAgo: 1200 },
  { senderId: 'alex_chen', text: 'Same! It\'ll be good to do something together', minutesAgo: 1195 },
  { senderId: 'jason_miller', text: 'It\'s just an escape room', minutesAgo: 1190 },
  { senderId: 'emma_davis', text: 'It\'s not about the activity, it\'s about spending time together', minutesAgo: 1185 },
  { senderId: 'jason_miller', text: 'Deep', minutesAgo: 1180 },
  { senderId: 'alex_chen', text: 'Jason seriously what\'s going on with you?', minutesAgo: 1175 },
  { senderId: 'jason_miller', text: 'Nothing. See you tomorrow', minutesAgo: 1170 },
  
  // Today - day of the hangout
  { senderId: 'alex_chen', text: 'Morning everyone! Ready for escape room day?', minutesAgo: 480 },
  { senderId: 'emma_davis', text: 'So ready! ☕️ Having my coffee now', minutesAgo: 475 },
  { senderId: 'jason_miller', text: 'Might be a few minutes late', minutesAgo: 470 },
  { senderId: 'alex_chen', text: 'No worries, just text when you\'re close', minutesAgo: 465 },
  { senderId: 'emma_davis', text: 'Should we wait to start or go ahead?', minutesAgo: 460 },
  { senderId: 'jason_miller', text: 'Just start without me', minutesAgo: 455 },
  { senderId: 'alex_chen', text: 'We\'ll wait. It\'s more fun with everyone', minutesAgo: 450 },
  { senderId: 'jason_miller', text: 'Whatever', minutesAgo: 445 },
  
  // Recent messages
  { senderId: 'emma_davis', text: 'Alex and I are here! Got a table at the cafe next door', minutesAgo: 120 },
  { senderId: 'alex_chen', text: 'Yeah we can wait here. They have good pastries', minutesAgo: 115 },
  { senderId: 'jason_miller', text: 'Almost there. Traffic', minutesAgo: 110 },
  { senderId: 'emma_davis', text: 'No rush! We\'re chatting and having coffee', minutesAgo: 105 },
  { senderId: 'jason_miller', text: 'Of course you are', minutesAgo: 100 },
  { senderId: 'alex_chen', text: 'What does that mean?', minutesAgo: 95 },
  { senderId: 'jason_miller', text: 'Nothing', minutesAgo: 90 },
  
  // Very recent
  { senderId: 'jason_miller', text: 'Parking now', minutesAgo: 30 },
  { senderId: 'emma_davis', text: 'Great! We\'ll head over to the escape room place', minutesAgo: 25 },
  { senderId: 'alex_chen', text: 'See you in there! This is gonna be fun', minutesAgo: 20 },
  { senderId: 'jason_miller', text: 'Sure', minutesAgo: 15 },
  { senderId: 'emma_davis', text: 'Jason please try to have fun? For us?', minutesAgo: 10 },
  { senderId: 'jason_miller', text: 'I said I\'m coming didn\'t I', minutesAgo: 5 },
  { senderId: 'alex_chen', text: 'Let\'s just focus on solving puzzles and having a good time', minutesAgo: 3 },
  { senderId: 'emma_davis', text: 'Agreed! Zombie apocalypse here we come! 🧟‍♀️', minutesAgo: 2 },
];