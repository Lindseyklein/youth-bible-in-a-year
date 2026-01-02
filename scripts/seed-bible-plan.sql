-- Comprehensive Chronological Bible Reading Plan with Summaries and Redemption Stories
-- Week 1: Creation & Fall

WITH plan AS (SELECT id FROM reading_plans WHERE title LIKE 'Bible in a Year%' LIMIT 1)

INSERT INTO daily_readings (plan_id, week_number, day_number, title, scripture_references, summary, redemption_story, key_verse, reflection_question)
VALUES
-- WEEK 1: Creation & Fall
((SELECT id FROM plan), 1, 1, 'The Beginning of Everything', ARRAY['Genesis 1', 'Genesis 2'],
 'God creates a perfect world and places humanity in the Garden of Eden. Everything starts with God speaking creation into existence, showing His power and intentional design.',
 'Before sin entered the world, God created humans in His image to have a relationship with Him. This shows God''s original plan was always about connection and love, not rules and distance.',
 'Genesis 1:27 - "So God created mankind in his own image, in the image of God he created them; male and female he created them."',
 'What does it mean to be created in God''s image? How does knowing this change how you see yourself and others?'),

((SELECT id FROM plan), 1, 2, 'When Everything Went Wrong', ARRAY['Genesis 3', 'Genesis 4', 'Genesis 5'],
 'Sin enters the world through Adam and Eve''s choice to disobey God. But even in judgment, God promises a future Redeemer who will crush the serpent''s head.',
 'The moment sin broke everything, God immediately promised rescue (Genesis 3:15). This is the first hint of Jesus - God''s plan to save us was instant, not an afterthought.',
 'Genesis 3:15 - "He will crush your head, and you will strike his heel."',
 'What "small" choices in your life might have bigger consequences than you think? How does God offer hope even when you mess up?'),

((SELECT id FROM plan), 1, 3, 'Starting Over: Noah''s Flood', ARRAY['Genesis 6', 'Genesis 7', 'Genesis 8', 'Genesis 9'],
 'God sees human wickedness has filled the earth and decides to start over, but saves Noah and his family. After the flood, God makes a covenant never to destroy the earth by flood again.',
 'Even when humanity deserved judgment, God provided a way of rescue through the ark. Noah''s ark is a picture of salvation - one door, one way in, and God shuts the door to keep them safe. Sound familiar?',
 'Genesis 6:8 - "But Noah found favor in the eyes of the Lord."',
 'Noah trusted God even when it seemed crazy. What is God asking you to trust Him with that feels uncomfortable?'),

((SELECT id FROM plan), 1, 4, 'Babel and the Nations', ARRAY['Genesis 10', 'Genesis 11'],
 'Humans try to make a name for themselves by building a tower to reach heaven. God scatters them by confusing their languages, but this scattering is actually part of His plan to reach all nations.',
 'Humanity tried to reach heaven on their own terms, but it didn''t work. Later, Jesus would come down from heaven to reach us. We can''t climb up to God - He came down to us.',
 'Genesis 11:4 - "Come, let us build ourselves a city, with a tower that reaches to the heavens, so that we may make a name for ourselves."',
 'Are you trying to build your own "tower" - making a name for yourself instead of living for God''s glory?'),

((SELECT id FROM plan), 1, 5, 'God Calls Abraham', ARRAY['Genesis 12', 'Genesis 13', 'Genesis 14'],
 'God calls Abram to leave everything familiar and go to a land He will show him. God promises to bless him and make him into a great nation that will bless the whole world.',
 'Through Abraham, God is starting His rescue plan for all humanity. One day, Jesus - a descendant of Abraham - would be the blessing to all nations that God promised.',
 'Genesis 12:2-3 - "I will make you into a great nation, and I will bless you... and all peoples on earth will be blessed through you."',
 'What would it look like for you to step out in faith like Abraham, even when you don''t see the whole plan?'),

((SELECT id FROM plan), 1, 6, 'God''s Promises to Abraham', ARRAY['Genesis 15', 'Genesis 16', 'Genesis 17'],
 'God makes a covenant with Abraham, promising him descendants as numerous as the stars. Abraham believes God, and it is credited to him as righteousness.',
 'Abraham couldn''t earn God''s promises through his actions - he received them by faith. This is the same way we receive salvation: not by being good enough, but by trusting in God''s promise through Jesus.',
 'Genesis 15:6 - "Abram believed the Lord, and he credited it to him as righteousness."',
 'Are you trying to earn God''s love through good behavior, or are you resting in His promises?'),

((SELECT id FROM plan), 1, 7, 'Sodom, Lot, and God''s Justice', ARRAY['Genesis 18', 'Genesis 19'],
 'God plans to destroy the wicked cities of Sodom and Gomorrah. Abraham intercedes for them, and God shows mercy to Lot by rescuing him before the destruction.',
 'God is both perfectly just and perfectly merciful. He can''t ignore sin, but He provides ways of escape for those who trust Him. Lot was saved not because he was perfect, but because God was merciful.',
 'Genesis 18:25 - "Will not the Judge of all the earth do right?"',
 'How do you balance understanding God''s justice with experiencing His mercy in your own life?'),

-- WEEK 2: Abraham, Isaac, and Jacob
((SELECT id FROM plan), 2, 1, 'Isaac: The Promised Son', ARRAY['Genesis 20', 'Genesis 21', 'Genesis 22'],
 'God fulfills His promise and gives Abraham and Sarah a son, Isaac. Then God tests Abraham by asking him to sacrifice Isaac, but provides a ram instead at the last moment.',
 'Abraham''s willingness to sacrifice his only son is a powerful picture of what God the Father would actually do - give His only Son, Jesus, as a sacrifice for us. But unlike Isaac, no substitute was provided for Jesus.',
 'Genesis 22:8 - "God himself will provide the lamb for the burnt offering, my son."',
 'What is the "Isaac" in your life - the thing you love most that God might be asking you to surrender?'),

((SELECT id FROM plan), 2, 2, 'Finding a Wife for Isaac', ARRAY['Genesis 23', 'Genesis 24'],
 'Abraham sends his servant to find a wife for Isaac from among his relatives. The servant prays for God''s guidance and God leads him to Rebekah, showing His perfect timing and care.',
 'God cares about the details of our lives. He orchestrated the meeting between Isaac and Rebekah, showing that He has good plans for us and guides us when we seek Him.',
 'Genesis 24:27 - "Praise be to the Lord... who has not abandoned his kindness and faithfulness to my master."',
 'Where do you need to see God''s guidance in your life right now? Are you asking Him and watching for His answers?'),

((SELECT id FROM plan), 2, 3, 'Jacob and Esau: The Struggle Begins', ARRAY['Genesis 25', 'Genesis 26'],
 'Isaac''s twin sons Jacob and Esau are born, and conflict starts immediately. Esau sells his birthright to Jacob for a bowl of stew, showing he didn''t value what God had given him.',
 'God chose Jacob (the younger, sneaky one) over Esau to continue the line to Jesus. This shows God doesn''t choose based on who deserves it or who''s first - He chooses based on His grace and purpose.',
 'Genesis 25:23 - "The older will serve the younger."',
 'Do you value the spiritual blessings God offers, or do you trade them for temporary satisfaction like Esau did?'),

((SELECT id FROM plan), 2, 4, 'Jacob Steals the Blessing', ARRAY['Genesis 27', 'Genesis 28'],
 'Jacob deceives his father Isaac and steals Esau''s blessing. He has to flee for his life, but on the way God appears to him in a dream and reaffirms His promises.',
 'Even when Jacob was running away from the consequences of his sin, God met him and promised to be with him. God''s plans aren''t stopped by our mistakes - He works through broken people.',
 'Genesis 28:15 - "I am with you and will watch over you wherever you go."',
 'What have you done that makes you feel like you''re running from God? How is He pursuing you anyway?'),

((SELECT id FROM plan), 2, 5, 'Jacob Gets a Taste of His Own Medicine', ARRAY['Genesis 29', 'Genesis 30'],
 'Jacob falls in love with Rachel but is tricked into marrying Leah first. He works 14 years for his wives, experiencing deception himself after deceiving others.',
 'God lets Jacob experience what he did to others, teaching him about consequences. But through this messy family, God still builds His people - showing He uses imperfect situations.',
 'Genesis 29:20 - "So Jacob served seven years to get Rachel, but they seemed like only a few days to him because of his love for her."',
 'How has experiencing hurt from others helped you understand how your actions affect people?'),

((SELECT id FROM plan), 2, 6, 'Jacob Returns Home', ARRAY['Genesis 31', 'Genesis 32'],
 'Jacob flees from Laban and heads home, terrified of facing Esau. The night before meeting him, Jacob wrestles with God and refuses to let go until God blesses him.',
 'Jacob wrestling with God shows us that God wants us to bring our struggles, fears, and questions directly to Him. God changed Jacob''s name to Israel, giving him a new identity.',
 'Genesis 32:28 - "Your name will no longer be Jacob, but Israel, because you have struggled with God and with humans and have overcome."',
 'What are you wrestling with God about? Are you holding on until He blesses you, or giving up too easily?'),

((SELECT id FROM plan), 2, 7, 'Reconciliation: Jacob and Esau Reunite', ARRAY['Genesis 33', 'Genesis 34', 'Genesis 35'],
 'Jacob and Esau meet after 20 years, and instead of revenge, Esau runs to embrace his brother. God protected Jacob and changed both brothers'' hearts.',
 'Forgiveness and reconciliation are central to God''s heart. Esau running to embrace Jacob is a picture of how God runs to embrace us when we return to Him.',
 'Genesis 33:4 - "But Esau ran to meet Jacob and embraced him; he threw his arms around his neck and kissed him. And they wept."',
 'Is there someone you need to forgive or someone you need to seek forgiveness from?'),

-- WEEK 3: Joseph - Part 1
((SELECT id FROM plan), 3, 1, 'Joseph''s Dreams and His Brothers'' Jealousy', ARRAY['Genesis 36', 'Genesis 37'],
 'Joseph, Jacob''s favorite son, shares dreams where his family bows to him. His jealous brothers sell him into slavery in Egypt and tell their father he''s dead.',
 'Even when everything went wrong for Joseph, God was setting up an incredible rescue plan - not just for Joseph, but for the entire family and nation. Sometimes our worst days are setting up God''s greatest miracles.',
 'Genesis 37:28 - "So when the Midianite merchants came by, his brothers pulled Joseph up out of the cistern and sold him."',
 'When has something bad happened that God later used for good in your life?'),

((SELECT id FROM plan), 3, 2, 'Joseph in Potiphar''s House', ARRAY['Genesis 38', 'Genesis 39'],
 'In Egypt, Joseph serves in Potiphar''s house and God blesses everything he does. When Potiphar''s wife tries to seduce him, Joseph refuses and runs - but gets thrown in prison anyway.',
 'Joseph chose to honor God even when it cost him everything. He ran from temptation even though it meant prison. Doing the right thing doesn''t always protect us from consequences, but it keeps us close to God.',
 'Genesis 39:9 - "How then could I do such a wicked thing and sin against God?"',
 'What temptation are you facing where you need to just run, even if there are consequences for doing the right thing?'),

((SELECT id FROM plan), 3, 3, 'Joseph Interprets Dreams in Prison', ARRAY['Genesis 40', 'Genesis 41'],
 'In prison, Joseph interprets dreams for Pharaoh''s cupbearer and baker. Two years later, when Pharaoh has disturbing dreams, Joseph is called to interpret them and becomes second-in-command of Egypt.',
 'Joseph waited years in slavery and prison, but never gave up on God. His faithfulness in the small things (prison) prepared him for big things (ruling Egypt). God''s timing is perfect, even when it feels slow.',
 'Genesis 41:16 - "I cannot do it, Joseph replied to Pharaoh, but God will give Pharaoh the answer he desires."',
 'What situation in your life feels like it''s taking forever? How can you stay faithful while you wait?'),

((SELECT id FROM plan), 3, 4, 'Famine and the First Trip to Egypt', ARRAY['Genesis 42', 'Genesis 43'],
 'Severe famine strikes, and Joseph''s brothers come to Egypt to buy food - not knowing their "dead" brother is the powerful governor. Joseph tests them but doesn''t reveal himself yet.',
 'Joseph is becoming who God called him to be - not for revenge, but to save his family. He tests his brothers not to hurt them, but to see if they''ve changed. God is always working on our hearts.',
 'Genesis 42:9 - "Then he remembered his dreams about them."',
 'How has God used difficult experiences to shape you into who you need to be?'),

((SELECT id FROM plan), 3, 5, 'Joseph Reveals Himself', ARRAY['Genesis 44', 'Genesis 45'],
 'Joseph finally reveals his identity to his brothers. They are terrified, but Joseph tells them not to be afraid - God sent him ahead to save lives during the famine.',
 'This is one of the most powerful pictures of redemption in the Bible. What was meant for evil, God used for good. Joseph forgave his brothers and saw God''s bigger plan. Jesus does the same for us - what was meant to destroy us, He uses to save us.',
 'Genesis 45:5 - "Do not be distressed and do not be angry with yourselves for selling me here, because it was to save lives that God sent me ahead of you."',
 'What situation in your past seemed terrible but might be part of God''s plan to save or help others?'),

((SELECT id FROM plan), 3, 6, 'Jacob''s Family Moves to Egypt', ARRAY['Genesis 46', 'Genesis 47'],
 'Jacob discovers Joseph is alive and moves his whole family to Egypt. God appears to Jacob and promises to go with him and bring his descendants back to the promised land.',
 'God goes with His people wherever they go. Even though Israel is leaving the promised land, God promises to bring them back. Nothing in our lives surprises God - He''s already planned the way forward.',
 'Genesis 46:3-4 - "Do not be afraid to go down to Egypt, for I will make you into a great nation there. I will go down to Egypt with you."',
 'Where is God calling you to go that feels scary? How does knowing He goes with you change your fear?'),

((SELECT id FROM plan), 3, 7, 'Jacob''s Final Blessings', ARRAY['Genesis 48', 'Genesis 49', 'Genesis 50'],
 'Jacob blesses Joseph''s sons and his own sons before he dies. Joseph''s brothers fear revenge after their father''s death, but Joseph reassures them of God''s good plan.',
 'The book of Genesis ends with Joseph''s powerful statement: "You intended to harm me, but God intended it for good." This is the story of the whole Bible - God turning evil into good, sin into salvation.',
 'Genesis 50:20 - "You intended to harm me, but God intended it for good to accomplish what is now being done, the saving of many lives."',
 'How can you see God''s redemption in your story - taking what was broken and using it for good?');
