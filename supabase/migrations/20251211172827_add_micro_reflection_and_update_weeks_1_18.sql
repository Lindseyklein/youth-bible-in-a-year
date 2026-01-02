/*
  # Add Micro Reflection and Update Redemption Stories for Weeks 1-18

  1. Changes
    - Add `micro_reflection` column to `daily_readings` table
    - Update redemption stories for weeks 1-18 with comprehensive content from PDF
    - Add micro reflections for each day in weeks 1-18

  2. Content
    - Weeks 1-18 now include detailed redemption stories and daily micro reflections
    - Each day has a personalized reflection question to help apply the reading
*/

-- Add micro_reflection column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_readings' AND column_name = 'micro_reflection'
  ) THEN
    ALTER TABLE daily_readings ADD COLUMN micro_reflection text;
  END IF;
END $$;

-- Update Week 1: In the Beginning
UPDATE daily_readings SET
  redemption_story = 'God creates everything good and perfect by His Word, showing His power, wisdom, and kindness. Even before sin, His plan is to dwell with His people in a world filled with His glory.',
  micro_reflection = 'Where do you see God''s goodness and creativity in your life or in the world today?'
WHERE week_number = 1 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'Humanity rebels and brings curse, shame, and death into the world, but God promises that the offspring of the woman will crush the serpent''s head—pointing to Christ as the coming Redeemer.',
  micro_reflection = 'When you mess up, do you tend to hide like Adam and Eve—or run to God for forgiveness?'
WHERE week_number = 1 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Sin spreads quickly—envy, violence, and death—but God preserves a faithful line through Seth, showing that His promise of a Savior will not fail despite human wickedness.',
  micro_reflection = 'What does this passage teach you about how serious sin is—and how faithful God is?'
WHERE week_number = 1 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'God judges the world''s evil with a flood, yet saves Noah and his family in the ark. This rescue points to Christ, our greater Ark of safety from God''s judgment.',
  micro_reflection = 'If Jesus is like the ark, what does it look like for you to "take refuge" in Him today?'
WHERE week_number = 1 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'God graciously makes a covenant never again to destroy the earth by flood, even though people still rebel and try to make a name for themselves at Babel. God''s judgment scatters them, but His redemptive plan continues.',
  micro_reflection = 'Are you more focused on building your own name—or trusting God''s plan and promises?'
WHERE week_number = 1 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'God calls Abram out of idolatry and promises to bless all nations through his offspring. This promise finds its fulfillment in Jesus, the true offspring of Abraham.',
  micro_reflection = 'Where might God be calling you to trust Him even when you can''t see the full picture yet?'
WHERE week_number = 1 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'Abram is blessed by Melchizedek, a priest-king who points forward to Christ, our ultimate Priest and King. Despite Abram''s failures with Hagar, God remains faithful to His promise of a coming Redeemer.',
  micro_reflection = 'How does it encourage you to know that God''s promises don''t fall apart when you fail?'
WHERE week_number = 1 AND day_number = 7;

-- Week 2: The Great Flood (Abraham/Isaac era)
UPDATE daily_readings SET
  redemption_story = 'God confirms His covenant with Abraham, gives the sign of circumcision, and promises a miraculous son. His plan of redemption rests on His faithfulness, not human strength.',
  micro_reflection = 'What feels "impossible" to you right now—and how does this story challenge that?'
WHERE week_number = 2 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'God judges the evil of Sodom, yet rescues Lot out of the city. This shows both the seriousness of sin and the mercy of God in delivering His people.',
  micro_reflection = 'How does seeing both God''s justice and mercy affect the way you think about sin?'
WHERE week_number = 2 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'God keeps His promise and brings Isaac—the child of promise—through whom the covenant line continues. His faithfulness to His word points forward to Christ, the true promised Son.',
  micro_reflection = 'When have you seen God come through on something in a way you didn''t expect?'
WHERE week_number = 2 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'God guides Abraham''s servant to Rebekah, preserving the covenant family through His providence. He is actively directing history toward His redemptive purposes.',
  micro_reflection = 'Where do you need to trust that God is quietly at work behind the scenes?'
WHERE week_number = 2 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'Even before they are born, God chooses Jacob over Esau, showing that His saving purposes depend on His grace, not on human merit or birth order.',
  micro_reflection = 'Does it comfort you or challenge you to know that God''s grace is not based on your performance?'
WHERE week_number = 2 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'Jacob deceives and runs, yet God meets him in a dream and repeats the covenant promises. God''s grace pursues sinners and secures His redemptive plan despite their failures.',
  micro_reflection = 'If you really believed God pursues you even when you run, what might change in your heart?'
WHERE week_number = 2 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'Through a messy, painful family situation, God builds the twelve tribes of Israel. He shows that His plan of salvation often unfolds through broken people and unexpected circumstances.',
  micro_reflection = 'How does this story speak into the messiness of your own family or friendships?'
WHERE week_number = 2 AND day_number = 7;

-- Week 3: Father of Faith
UPDATE daily_readings SET
  redemption_story = 'Jacob wrestles with God and is given a new name, Israel. God breaks his self-reliance and blesses him, showing that true transformation comes from God''s gracious encounter.',
  micro_reflection = 'What "wrestling match" are you having with God right now—and what might He be trying to shape in you?'
WHERE week_number = 3 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'God brings reconciliation between Jacob and Esau and reaffirms His promises at Bethel. This points to the peace with God and others that Christ secures through His cross.',
  micro_reflection = 'Is there a relationship in your life where God might be inviting you to take a step toward reconciliation?'
WHERE week_number = 3 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Joseph is betrayed and sold into slavery, yet God is at work through evil actions to position him for future deliverance. God turns what others mean for harm into part of His redemptive plan.',
  micro_reflection = 'Can you think of a hard situation where God might be working in ways you can''t see yet?'
WHERE week_number = 3 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'While Joseph suffers unjustly and waits in prison, God is still present with him and preparing the way for salvation. Redemption often comes through suffering before glory.',
  micro_reflection = 'When life feels unfair, how does Joseph''s story encourage you to keep trusting God?'
WHERE week_number = 3 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'God exalts Joseph to second-in-command in Egypt so that many lives will be saved from famine. This foreshadows Christ, who is exalted to save His people from sin and death.',
  micro_reflection = 'If God gives you influence or success, how can you use it to bless others and honor Him?'
WHERE week_number = 3 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'Joseph''s brothers come to him in their need, not knowing who he is. God uses this famine to bring them face-to-face with their sin and begin a process of repentance and restoration.',
  micro_reflection = 'What might God be using right now to get your attention or soften your heart?'
WHERE week_number = 3 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'Joseph forgives his brothers and sees God''s hand in their evil actions, saying, "God sent me before you." This points to Christ, who was betrayed and suffered so many could be saved.',
  micro_reflection = 'Who do you need help forgiving—and how does Jesus'' forgiveness toward you shape that?'
WHERE week_number = 3 AND day_number = 7;

-- Week 4: The Promised Son
UPDATE daily_readings SET
  redemption_story = 'God leads Jacob and his family into Egypt, promising to be with them and make them a great nation there. Even in a foreign land, His covenant purposes continue.',
  micro_reflection = 'Have you ever felt "out of place" but later realized God was still guiding you there?'
WHERE week_number = 4 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'Jacob prophesies that the scepter will not depart from Judah, pointing directly to Jesus, the eternal King. Joseph''s trust that God will one day bring them back to the land shows faith in God''s future redemption.',
  micro_reflection = 'How does knowing Jesus is the true King give you hope in an unstable world?'
WHERE week_number = 4 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Job loses almost everything yet does not curse God. His suffering shows that faith can cling to God even when blessings are stripped away, pointing to a Redeemer greater than earthly comfort.',
  micro_reflection = 'If your comfort was shaken, would your faith rest more in God—or in His gifts?'
WHERE week_number = 4 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'Job honestly wrestles with his pain and confusion before God. Redemption includes bringing our deepest questions and sorrows to the Lord, trusting Him even without full answers.',
  micro_reflection = 'Are you being honest with God about what hurts or confuses you—or are you stuffing it down?'
WHERE week_number = 4 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'Job''s friends wrongly assume that suffering always equals personal sin. This highlights the need for a Redeemer who truly understands righteous suffering—fulfilled in Christ.',
  micro_reflection = 'When you see someone suffer, do you assume they did something wrong—or do you move toward them with compassion?'
WHERE week_number = 4 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'Job cries out that his Redeemer lives and that he will one day see God. This is a powerful anticipation of the risen Christ and the hope of resurrection.',
  micro_reflection = 'What difference does it make in your daily life that your Redeemer is alive right now?'
WHERE week_number = 4 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'Job realizes that true wisdom belongs to God alone and is found in fearing Him. Redemption leads us to humble reliance on God''s wisdom instead of our own understanding.',
  micro_reflection = 'Do you tend to lean more on your own opinions—or on what God says is wise?'
WHERE week_number = 4 AND day_number = 7;

-- Week 5: Jacob's Transformation
UPDATE daily_readings SET
  redemption_story = 'Job defends his integrity while Elihu insists that God is always just and right. This tension prepares the way for God Himself to speak and reveal His greater purposes.',
  micro_reflection = 'How do you respond when God''s character and your experience seem to clash?'
WHERE week_number = 5 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'God speaks out of the whirlwind, not explaining everything but revealing His power, wisdom, and sovereignty. Redemption starts with seeing God as He truly is, not as we imagine Him.',
  micro_reflection = 'What part of God''s greatness in this passage stands out to you—and how does it humble you?'
WHERE week_number = 5 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Job repents in dust and ashes, and God restores him and rebukes his friends. The end of Job''s story shows that God is compassionate and merciful, even after deep suffering.',
  micro_reflection = 'Is there an area where you need to repent and trust that God is still merciful toward you?'
WHERE week_number = 5 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'God sees His people''s oppression in Egypt and raises up Moses to deliver them. This sets the stage for the great act of redemption in the Old Testament, pointing to Christ, our greater Deliverer.',
  micro_reflection = 'Where in your life—or in the world—do you long for God to step in and bring deliverance?'
WHERE week_number = 5 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'Moses obeys God''s call and confronts Pharaoh, even as things initially get worse. Redemption often begins in weakness and opposition, but God''s word will stand.',
  micro_reflection = 'Have you ever obeyed God and felt like it backfired at first? How might this story encourage you?'
WHERE week_number = 5 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'God displays His power over Egypt''s gods and Pharaoh''s hardened heart. He shows that He alone is Lord and that salvation comes by His mighty hand.',
  micro_reflection = 'What "false gods" (idols) do people around you trust in—and how does this passage call you back to the true God?'
WHERE week_number = 5 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'God saves His people through the blood of the Passover lamb, sparing them from judgment. This points clearly to Jesus, the Lamb of God whose blood shields us from God''s wrath.',
  micro_reflection = 'When you think about Jesus as your Passover Lamb, what does that say about how valuable you are to Him?'
WHERE week_number = 5 AND day_number = 7;

-- Week 6: The Great Exodus
UPDATE daily_readings SET
  redemption_story = 'God delivers Israel by parting the Red Sea, showing that salvation is entirely His work. He saves His people not by their strength but by His mighty power.',
  micro_reflection = 'Where do you need God to make a "way through the waters" in your life right now?'
WHERE week_number = 6 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'God provides water, food, protection, and guidance, revealing Himself as the One who sustains His people even when they grumble.',
  micro_reflection = 'Do you trust God to provide when life feels dry or disappointing?'
WHERE week_number = 6 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'God makes Israel His treasured possession and gives His law so they may live as His redeemed people. Salvation comes first, obedience follows.',
  micro_reflection = 'How does remembering God''s grace help you want to obey Him?'
WHERE week_number = 6 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'The covenant is confirmed with blood, pointing to Jesus whose blood establishes the new and better covenant.',
  micro_reflection = 'What does Jesus'' sacrifice say about how committed God is to you?'
WHERE week_number = 6 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'God designs the tabernacle so He can dwell among His people—showing His desire to be near them. Christ later "tabernacles" with us in the flesh.',
  micro_reflection = 'Do you believe God truly wants to be close to you?'
WHERE week_number = 6 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'God establishes priests to represent the people, foreshadowing Jesus, our perfect High Priest who brings us into God''s presence.',
  micro_reflection = 'How does knowing Jesus intercedes for you change the way you pray?'
WHERE week_number = 6 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'Israel turns to idolatry, yet Moses intercedes and God shows mercy. This reveals both the seriousness of sin and the power of a mediator—fulfilled in Christ.',
  micro_reflection = 'What "idols" tend to pull your heart away from God?'
WHERE week_number = 6 AND day_number = 7;

-- Week 7: Covenant Broken, Covenant Restored
UPDATE daily_readings SET
  redemption_story = 'God reveals His name—merciful, gracious, slow to anger—and renews the covenant despite Israel''s rebellion. His mercy triumphs over judgment.',
  micro_reflection = 'Do you think of God more as harsh or merciful? Why?'
WHERE week_number = 7 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'Israel obeys God''s instructions exactly, showing restored relationship and joyful obedience. Redemption leads to worship.',
  micro_reflection = 'How can your obedience today be an act of worship?'
WHERE week_number = 7 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'God''s glory fills the tabernacle—He moves in with His people. Leviticus begins by explaining how sinful people can approach a holy God.',
  micro_reflection = 'Do you see God as distant or near? What shapes that feeling?'
WHERE week_number = 7 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'God provides a way for sin to be forgiven through sacrifice, pointing directly to Jesus—the once-for-all sacrifice for sin.',
  micro_reflection = 'What does sacrifice teach you about God''s holiness and your need for forgiveness?'
WHERE week_number = 7 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'The priests are set apart to represent the people before God, foreshadowing Christ who brings us into God''s presence perfectly.',
  micro_reflection = 'How does Jesus being your High Priest give you confidence before God?'
WHERE week_number = 7 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'Nadab and Abihu''s judgment shows God''s holiness, while the laws of cleansing reveal His desire for His people to be set apart.',
  micro_reflection = 'Are you treating God with reverence—or casually?'
WHERE week_number = 7 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'Unclean people are restored through priestly inspection, symbolizing how Christ cleanses our deepest uncleanness and brings us back into community.',
  micro_reflection = 'Where do you need Christ''s cleansing work in your life?'
WHERE week_number = 7 AND day_number = 7;

-- Week 8: Holiness & Atonement
UPDATE daily_readings SET
  redemption_story = 'God explains how blood makes atonement for sin, preparing the way for Jesus whose blood fully and finally cleanses us.',
  micro_reflection = 'What does it mean to you that Jesus shed His blood for you personally?'
WHERE week_number = 8 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'God calls His people to live differently from the nations. Redemption produces holiness, not compromise.',
  micro_reflection = 'Where is God calling you to live differently from the world around you?'
WHERE week_number = 8 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Because God is holy, His people and priests must live set apart. Jesus is the holy, perfect Priest who fulfills every requirement.',
  micro_reflection = 'What does Jesus'' perfect holiness mean for your identity?'
WHERE week_number = 8 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'The Year of Jubilee points to Christ who sets captives free, restores what was lost, and brings ultimate spiritual rest.',
  micro_reflection = 'Where do you long for freedom or restoration in your life?'
WHERE week_number = 8 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'God organizes His redeemed people for life in community and worship. Redemption creates order, purpose, and belonging.',
  micro_reflection = 'Where do you need God to bring more order or purpose into your life?'
WHERE week_number = 8 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'Israel is arranged around God''s presence. Their entire identity and orientation revolve around Him—just as ours should revolve around Christ.',
  micro_reflection = 'What is currently at the center of your life? Is it Christ?'
WHERE week_number = 8 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'God calls His people to purity and wholehearted dedication, showing that redeemed people belong completely to Him.',
  micro_reflection = 'What would wholehearted devotion to God look like for you this week?'
WHERE week_number = 8 AND day_number = 7;

-- Week 9: Wandering & God's Faithfulness
UPDATE daily_readings SET
  redemption_story = 'Israel complains again, but God provides again—showing His patience and faithfulness even when His people fail.',
  micro_reflection = 'Do you focus more on what you lack or on how God has already provided?'
WHERE week_number = 9 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'Israel refuses to enter the land, and God judges the unbelief of that generation. Yet He preserves the promise through Joshua and Caleb.',
  micro_reflection = 'What fear or unbelief keeps you from trusting God''s promises?'
WHERE week_number = 9 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'God defends His chosen priesthood and judges rebellion, but He also provides atonement to stop the plague—pointing to Christ''s greater mediation.',
  micro_reflection = 'How do you respond when God confronts areas of pride or rebellion in your heart?'
WHERE week_number = 9 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'Even great leaders fail. Moses disobeys and cannot enter the land, reminding us that no human leader—not even Moses—can bring God''s people into the ultimate rest. Only Christ can.',
  micro_reflection = 'What does this passage teach you about your need for a perfect Savior?'
WHERE week_number = 9 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'God heals those who look to the bronze serpent, a direct picture of Christ who is lifted up so sinners who look to Him may live.',
  micro_reflection = 'Where do you need to look to Jesus today instead of trying to fix things yourself?'
WHERE week_number = 9 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'Balaam prophesies about a coming King—a star rising out of Jacob—anticipating Christ, the true King who crushes evil.',
  micro_reflection = 'How does knowing Christ is the true King give you courage?'
WHERE week_number = 9 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'God appoints Joshua to lead His people, foreshadowing Jesus (Yeshua), who brings His people into the greater promised land.',
  micro_reflection = 'Where do you need Jesus to lead you forward when you''re unsure what comes next?'
WHERE week_number = 9 AND day_number = 7;

-- Week 10: Preparing for the Promised Land
UPDATE daily_readings SET
  redemption_story = 'God calls His people to integrity in their vows and teaches them that obedience matters even in practical decisions.',
  micro_reflection = 'Is there a commitment you need to keep—or a compromise you need to let go of?'
WHERE week_number = 10 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'God reviews Israel''s entire journey, showing that He has led, corrected, and provided every step of the way. Redemption remembers God''s faithfulness.',
  micro_reflection = 'How has God guided you in ways you didn''t notice until later?'
WHERE week_number = 10 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Moses retells Israel''s journey and emphasizes God''s faithfulness despite their rebellion. God keeps His promises even when His people fail.',
  micro_reflection = 'Where do you need to be reminded of God''s faithfulness?'
WHERE week_number = 10 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'God calls Israel to love Him with all their heart, soul, and strength. True obedience flows out of remembering who God is and what He''s done.',
  micro_reflection = 'What competes most for your heart''s attention and love?'
WHERE week_number = 10 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'God chooses Israel not because of their greatness but because of His love. This points to the gospel: God loves His people because He loves them—not because they earn it.',
  micro_reflection = 'How does knowing God loves you because He loves you—not because you''re "good enough"—change your identity?'
WHERE week_number = 10 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'God calls Israel to choose life through obedience, pointing toward Christ who perfectly obeys and gives His people new hearts to follow Him.',
  micro_reflection = 'What small step of obedience could you take today?'
WHERE week_number = 10 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'God lays out laws for justice, mercy, and future kingship—preparing the way for Christ, the righteous King who rules with justice and grace.',
  micro_reflection = 'What part of Jesus'' kingship encourages you or challenges you most?'
WHERE week_number = 10 AND day_number = 7;

-- Week 11: Covenant Renewal
UPDATE daily_readings SET
  redemption_story = 'God promises to raise up a prophet greater than Moses—one who speaks God''s words perfectly. This promise finds its fulfillment in Jesus, the final and perfect Prophet.',
  micro_reflection = 'Whose voice do you listen to most—and how can you make more room for Jesus'' words?'
WHERE week_number = 11 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'God''s laws emphasize justice, compassion, and purity, reflecting His holy character. These laws point to Christ, who fulfills righteousness on our behalf.',
  micro_reflection = 'Where is God calling you to act with more integrity or compassion?'
WHERE week_number = 11 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Israel is reminded that blessing comes from obedience and curse from rebellion. Christ later redeems His people from the curse of the law by becoming a curse for us.',
  micro_reflection = 'How does Jesus taking the curse for you change the way you view your sin?'
WHERE week_number = 11 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'God sets before Israel life and death, blessing and curse. He calls them to choose life by loving and obeying Him—fulfilled as Christ gives His people new hearts to follow Him.',
  micro_reflection = 'What decision do you need to surrender to God to truly "choose life"?'
WHERE week_number = 11 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'Moses commissions Joshua and writes down the law. Even in Moses'' passing, God''s redemptive plan continues, showing He is the true leader of His people.',
  micro_reflection = 'Where do you need to trust God''s leadership more than human leadership?'
WHERE week_number = 11 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'Moses sings of Israel''s past failures but also God''s unwavering faithfulness, then blesses the tribes. Redemption always rests on God''s character, not human performance.',
  micro_reflection = 'What part of God''s character gives you the most hope right now?'
WHERE week_number = 11 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'Moses dies without entering the land, but Joshua rises to lead Israel. Rahab, a Canaanite woman, believes God and is saved—showing that salvation is by faith, not background.',
  micro_reflection = 'How does Rahab''s story challenge your assumptions about who God can save?'
WHERE week_number = 11 AND day_number = 7;

-- Week 12: Into the Promised Land
UPDATE daily_readings SET
  redemption_story = 'God parts the Jordan and brings down Jericho''s walls, proving He fights for His people and keeps His promises.',
  micro_reflection = 'Where do you need God to "bring down walls" in your life?'
WHERE week_number = 12 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'Achan''s sin affects the whole nation, showing the seriousness of rebellion. But God restores Israel after judgment, revealing His commitment to holiness and mercy.',
  micro_reflection = 'Is there hidden sin you need to confess so healing can begin?'
WHERE week_number = 12 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'God makes the sun stand still and gives Israel victory. Redemption is not human achievement—it is God''s power accomplishing His purposes.',
  micro_reflection = 'Where do you need to rely on God''s strength instead of your own?'
WHERE week_number = 12 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'God distributes the promised land, proving that every promise He made to Abraham is coming true. God finishes what He starts.',
  micro_reflection = 'What promise of God do you need to hold onto more tightly?'
WHERE week_number = 12 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'Israel receives rest from their enemies, foreshadowing the deeper spiritual rest Christ gives to His people.',
  micro_reflection = 'Where in your heart do you feel restless today?'
WHERE week_number = 12 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'Joshua reminds Israel that God has been faithful in every way, calling them to serve the Lord wholeheartedly.',
  micro_reflection = 'What area of your life needs renewed commitment to God?'
WHERE week_number = 12 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'Israel fails to drive out the nations and falls into sin, yet God raises judges to deliver them—pointing to the ultimate Deliverer, Jesus.',
  micro_reflection = 'Where are you stuck in a cycle that God wants to break?'
WHERE week_number = 12 AND day_number = 7;

-- Week 13: The Judges Era
UPDATE daily_readings SET
  redemption_story = 'God delivers Israel through Deborah, Barak, and Jael—showing that He uses unexpected people to accomplish His purposes.',
  micro_reflection = 'Do you believe God can use you—even if you don''t feel qualified?'
WHERE week_number = 13 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'God calls fearful Gideon and defeats Israel''s enemies with just 300 men, proving salvation belongs to God alone.',
  micro_reflection = 'Where is God calling you to trust Him despite feeling weak?'
WHERE week_number = 13 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Israel''s rebellion brings painful consequences, yet God continues to raise up flawed deliverers, pointing to the need for a perfect Savior.',
  micro_reflection = 'How do consequences in your life remind you of your need for Jesus?'
WHERE week_number = 13 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'God raises Samson, a deeply flawed man, to begin rescuing Israel from the Philistines. God''s grace works even through weak and sinful people.',
  micro_reflection = 'What area of weakness could God still use for good?'
WHERE week_number = 13 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'Samson''s failure brings destruction, yet his final act brings victory through his death—pointing faintly toward Christ, who wins salvation through His death.',
  micro_reflection = 'Where do you need God''s strength to help you resist temptation?'
WHERE week_number = 13 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'Israel plunges into deep moral chaos, showing the devastating result of "everyone doing what was right in his own eyes." The need for a righteous King becomes painfully clear.',
  micro_reflection = 'Where do you need God to correct your idea of what''s "right in your own eyes"?'
WHERE week_number = 13 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'God redeems Ruth through Boaz, establishing the family line of David and ultimately Jesus. Through ordinary faithfulness, God accomplishes extraordinary redemption.',
  micro_reflection = 'How might your everyday choices be part of God''s bigger story?'
WHERE week_number = 13 AND day_number = 7;

-- Week 14: Rise of the Kings
UPDATE daily_readings SET
  redemption_story = 'God hears Hannah''s prayer and raises Samuel to lead Israel back to Him. Redemption often begins with God hearing the cries of the humble.',
  micro_reflection = 'What prayer do you need to bring to God persistently?'
WHERE week_number = 14 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'Israel treats the ark like a lucky charm and suffers defeat. But when they repent, God restores them—showing redemption comes through humility, not superstition.',
  micro_reflection = 'Do you treat God like someone to use—or someone to trust?'
WHERE week_number = 14 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Israel rejects God as King, but God gives them Saul while preparing a better King to come—Jesus, the true King of God''s people.',
  micro_reflection = 'Where do you tend to choose your own solutions instead of trusting God''s leadership?'
WHERE week_number = 14 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'Saul wins military victories, but his disobedience shows that Israel needs a king after God''s own heart.',
  micro_reflection = 'What does Saul teach you about the danger of half-obedience?'
WHERE week_number = 14 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'Saul''s repeated disobedience leads to God rejecting him as king. This paves the way for David—and ultimately for Christ''s perfect kingship.',
  micro_reflection = 'What is one area where you need to obey God fully rather than partially?'
WHERE week_number = 14 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'God chooses David, a humble shepherd, and defeats Goliath through him—showing salvation comes by God''s power, not human strength.',
  micro_reflection = 'Where do you need God''s courage to face something that feels giant-sized?'
WHERE week_number = 14 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'Jonathan makes a covenant with David, pointing to God''s covenant love. David''s rising favor shows God is establishing His chosen king.',
  micro_reflection = 'How can you build friendships that point each other toward God?'
WHERE week_number = 14 AND day_number = 7;

-- Week 15: David's Rise & Saul's Decline
UPDATE daily_readings SET
  redemption_story = 'Even while fleeing for his life, David refuses to harm Saul. God protects David and shapes his character, preparing him to be a righteous king.',
  micro_reflection = 'How do you typically respond when someone mistreats you?'
WHERE week_number = 15 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'God uses Abigail''s wisdom to restrain David from sin, showing that redemption often comes through humble peacemakers.',
  micro_reflection = 'Who has God used to redirect you when you were headed toward a bad decision?'
WHERE week_number = 15 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Saul''s death reveals the consequences of rejecting God. Yet through Saul''s fall, God clears the way for David—the king through whom Christ will come.',
  micro_reflection = 'What warning can you learn from Saul''s life?'
WHERE week_number = 15 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'David mourns Saul and Jonathan, showing a heart shaped by God. God begins establishing David''s kingdom, pointing toward Christ''s everlasting kingdom.',
  micro_reflection = 'How can your response to painful moments reflect God''s heart?'
WHERE week_number = 15 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'David brings the ark to Jerusalem, celebrating God''s presence. This anticipates Christ, who brings God''s presence to His people fully.',
  micro_reflection = 'What brings you joy about God being near?'
WHERE week_number = 15 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'God promises David an eternal throne—fulfilled in Jesus, the Son of David whose kingdom will never end.',
  micro_reflection = 'How does it strengthen your faith to know Jesus'' kingdom is unshakable?'
WHERE week_number = 15 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'David sins deeply, but when he repents, God forgives him. Yet sin still brings painful consequences. This points to Christ, who provides full forgiveness and a new heart.',
  micro_reflection = 'Is there something you need to bring into the light and repent of today?'
WHERE week_number = 15 AND day_number = 7;

-- Week 16: Kings, Prophets & God's Justice
UPDATE daily_readings SET
  redemption_story = 'Even as kings lead Israel deeper into sin, God continues sending prophets and giving mercy. His patience foreshadows Christ, who offers salvation even to hardened hearts.',
  micro_reflection = 'Where do you see God''s patience in your life right now?'
WHERE week_number = 16 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'Ahaz rejects God and turns to foreign idols, yet God preserves a faithful remnant—preparing the line through which Christ will come.',
  micro_reflection = 'What "false saviors" tempt you to trust them instead of God?'
WHERE week_number = 16 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Through Hezekiah''s prayer, God delivers Jerusalem, revealing His power to save. Yet Manasseh''s wickedness shows Israel''s desperate need for a greater, perfect King—Jesus.',
  micro_reflection = 'Do you pray like Hezekiah—with confidence that God hears?'
WHERE week_number = 16 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'Josiah restores worship and renews the covenant. His reforms preview Christ, who brings a greater reformation: hearts transformed by the Spirit.',
  micro_reflection = 'What spiritual habit do you need to "reform" or rebuild?'
WHERE week_number = 16 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'Judgment arrives as God had warned, yet He preserves a remnant. Even in exile, the seed of hope remains—Christ will come through the line of David.',
  micro_reflection = 'How does knowing God keeps His promises—both warnings and blessings—shape your choices?'
WHERE week_number = 16 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'Psalm 2 proclaims the true King whom God has installed—pointing directly to Jesus, the anointed Son.',
  micro_reflection = 'Which path are you walking today: the way of the righteous or the way of the wicked?'
WHERE week_number = 16 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'David proclaims God as refuge and foretells the Holy One who will not see decay—fulfilled in Christ''s resurrection.',
  micro_reflection = 'Where do you look for safety when life feels overwhelming?'
WHERE week_number = 16 AND day_number = 7;

-- Week 17: Praise, Lament & Hope
UPDATE daily_readings SET
  redemption_story = 'Psalm 22 vividly portrays Christ''s crucifixion, centuries before it happens, showing God''s plan of redemption from the beginning.',
  micro_reflection = 'What does Jesus'' suffering say about your value to Him?'
WHERE week_number = 17 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'The Good Shepherd who walks with His people through every valley is ultimately revealed in Jesus, who lays down His life for the sheep.',
  micro_reflection = 'Where do you need to let God shepherd you instead of trying to lead yourself?'
WHERE week_number = 17 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Even when surrounded by trouble, David declares that God is his fortress. Christ becomes our true refuge through His death and resurrection.',
  micro_reflection = 'What situation are you trying to control instead of surrendering?'
WHERE week_number = 17 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'These psalms reflect deep suffering and longing for rescue—fulfilled in Christ, who carries our griefs and restores hope.',
  micro_reflection = 'Where do you feel discouraged today—and how can you bring that to God?'
WHERE week_number = 17 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'David''s confession (Psalm 51) points to the sacrifice of Christ, the only one who can cleanse us from sin and renew our hearts.',
  micro_reflection = 'Is there a sin you need to confess so God can restore joy?'
WHERE week_number = 17 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'These psalms show God protecting His people from enemies. Christ becomes our eternal stronghold through His triumph over sin and death.',
  micro_reflection = 'What fear do you need to hand over to God today?'
WHERE week_number = 17 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'God''s steadfast love endures, and His salvation reaches the ends of the earth—fulfilled in Jesus'' Great Commission.',
  micro_reflection = 'Where have you seen God''s faithfulness this week?'
WHERE week_number = 17 AND day_number = 7;

-- Week 18: Wisdom for Life
UPDATE daily_readings SET
  redemption_story = 'Psalm 72 paints the portrait of the perfect King who brings justice and peace—fulfilled in Jesus Christ, the eternal Son of David.',
  micro_reflection = 'What part of Jesus'' kingship encourages you most?'
WHERE week_number = 18 AND day_number = 1;

UPDATE daily_readings SET
  redemption_story = 'Even when life feels unfair, the psalmists learn that true hope is found in God alone—pointing toward Christ as our ultimate portion.',
  micro_reflection = 'What situation tempts you to envy others?'
WHERE week_number = 18 AND day_number = 2;

UPDATE daily_readings SET
  redemption_story = 'Israel''s repeated failures highlight humanity''s need for a faithful Shepherd-King—Jesus, who never fails His people.',
  micro_reflection = 'What lesson do you need to learn from your own spiritual history?'
WHERE week_number = 18 AND day_number = 3;

UPDATE daily_readings SET
  redemption_story = 'God''s steadfast covenant with David points directly to Christ, whose kingdom and mercy endure forever.',
  micro_reflection = 'How does God''s faithfulness give you peace today?'
WHERE week_number = 18 AND day_number = 4;

UPDATE daily_readings SET
  redemption_story = 'Moses'' prayer reminds us of God''s eternal nature. Christ later becomes the true dwelling place where we find rest.',
  micro_reflection = 'What kind of rest are you needing from God?'
WHERE week_number = 18 AND day_number = 5;

UPDATE daily_readings SET
  redemption_story = 'These psalms proclaim God''s majesty and sovereignty. Christ, the exact image of God, brings His reign to earth through the gospel.',
  micro_reflection = 'What helps you remember that God is in control?'
WHERE week_number = 18 AND day_number = 6;

UPDATE daily_readings SET
  redemption_story = 'Israel''s history is a story of God''s redeeming faithfulness. Jesus becomes the ultimate display of God''s steadfast love.',
  micro_reflection = 'What is one way God has rescued you in the past?'
WHERE week_number = 18 AND day_number = 7;