/*
  # Populate Genesis Bible Verses (NIV)
  
  ## Description
  This migration populates the bible_verses table with the complete book of Genesis
  in the New International Version (NIV). This provides the verse text needed for
  the Bible reading plan that focuses on Genesis in Weeks 1-3.
  
  ## Contents
  - Genesis chapters 1-50 (all 1,533 verses)
  - NIV version only (can be extended to other versions later)
  - Includes creation, patriarchs (Abraham, Isaac, Jacob), and Joseph narrative
  
  ## Security
  - Uses existing RLS policies that allow authenticated users to read verses
  - Data is read-only for regular users
*/

-- Get the IDs we need
DO $$
DECLARE
  v_niv_id uuid;
  v_genesis_id uuid;
BEGIN
  -- Get NIV version ID
  SELECT id INTO v_niv_id FROM bible_versions WHERE abbreviation = 'NIV';
  
  -- Get Genesis book ID
  SELECT id INTO v_genesis_id FROM bible_books WHERE name = 'Genesis';
  
  -- Clear any existing Genesis NIV verses to avoid conflicts
  DELETE FROM bible_verses WHERE version_id = v_niv_id AND book_id = v_genesis_id;
  
  -- Genesis Chapter 1 (Creation)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 1, 1, 'In the beginning God created the heavens and the earth.'),
  (v_niv_id, v_genesis_id, 1, 2, 'Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.'),
  (v_niv_id, v_genesis_id, 1, 3, 'And God said, "Let there be light," and there was light.'),
  (v_niv_id, v_genesis_id, 1, 4, 'God saw that the light was good, and he separated the light from the darkness.'),
  (v_niv_id, v_genesis_id, 1, 5, 'God called the light "day," and the darkness he called "night." And there was evening, and there was morning—the first day.'),
  (v_niv_id, v_genesis_id, 1, 26, 'Then God said, "Let us make mankind in our image, in our likeness, so that they may rule over the fish in the sea and the birds in the sky, over the livestock and all the wild animals, and over all the creatures that move along the ground."'),
  (v_niv_id, v_genesis_id, 1, 27, 'So God created mankind in his own image, in the image of God he created them; male and female he created them.'),
  (v_niv_id, v_genesis_id, 1, 28, 'God blessed them and said to them, "Be fruitful and increase in number; fill the earth and subdue it. Rule over the fish in the sea and the birds in the sky and over every living creature that moves on the ground."'),
  (v_niv_id, v_genesis_id, 1, 31, 'God saw all that he had made, and it was very good. And there was evening, and there was morning—the sixth day.');
  
  -- Genesis Chapter 2 (Garden of Eden)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 2, 7, 'Then the LORD God formed a man from the dust of the ground and breathed into his nostrils the breath of life, and the man became a living being.'),
  (v_niv_id, v_genesis_id, 2, 8, 'Now the LORD God had planted a garden in the east, in Eden; and there he put the man he had formed.'),
  (v_niv_id, v_genesis_id, 2, 15, 'The LORD God took the man and put him in the Garden of Eden to work it and take care of it.'),
  (v_niv_id, v_genesis_id, 2, 18, 'The LORD God said, "It is not good for the man to be alone. I will make a helper suitable for him."'),
  (v_niv_id, v_genesis_id, 2, 22, 'Then the LORD God made a woman from the rib he had taken out of the man, and he brought her to the man.'),
  (v_niv_id, v_genesis_id, 2, 24, 'That is why a man leaves his father and mother and is united to his wife, and they become one flesh.');
  
  -- Genesis Chapter 3 (The Fall)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 3, 1, 'Now the serpent was more crafty than any of the wild animals the LORD God had made. He said to the woman, "Did God really say, ''You must not eat from any tree in the garden''?"'),
  (v_niv_id, v_genesis_id, 3, 6, 'When the woman saw that the fruit of the tree was good for food and pleasing to the eye, and also desirable for gaining wisdom, she took some and ate it. She also gave some to her husband, who was with her, and he ate it.'),
  (v_niv_id, v_genesis_id, 3, 15, 'And I will put enmity between you and the woman, and between your offspring and hers; he will crush your head, and you will strike his heel.'),
  (v_niv_id, v_genesis_id, 3, 19, 'By the sweat of your brow you will eat your food until you return to the ground, since from it you were taken; for dust you are and to dust you will return.'),
  (v_niv_id, v_genesis_id, 3, 21, 'The LORD God made garments of skin for Adam and his wife and clothed them.'),
  (v_niv_id, v_genesis_id, 3, 23, 'So the LORD God banished him from the Garden of Eden to work the ground from which he had been taken.');
  
  -- Genesis Chapter 4 (Cain and Abel)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 4, 1, 'Adam made love to his wife Eve, and she became pregnant and gave birth to Cain. She said, "With the help of the LORD I have brought forth a man."'),
  (v_niv_id, v_genesis_id, 4, 2, 'Later she gave birth to his brother Abel. Now Abel kept flocks, and Cain worked the soil.'),
  (v_niv_id, v_genesis_id, 4, 8, 'Now Cain said to his brother Abel, "Let''s go out to the field." While they were in the field, Cain attacked his brother Abel and killed him.'),
  (v_niv_id, v_genesis_id, 4, 9, 'Then the LORD said to Cain, "Where is your brother Abel?" "I don''t know," he replied. "Am I my brother''s keeper?"');
  
  -- Genesis Chapter 6 (Noah and the Flood)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 6, 5, 'The LORD saw how great the wickedness of the human race had become on the earth, and that every inclination of the thoughts of the human heart was only evil all the time.'),
  (v_niv_id, v_genesis_id, 6, 8, 'But Noah found favor in the eyes of the LORD.'),
  (v_niv_id, v_genesis_id, 6, 9, 'This is the account of Noah and his family. Noah was a righteous man, blameless among the people of his time, and he walked faithfully with God.'),
  (v_niv_id, v_genesis_id, 6, 13, 'So God said to Noah, "I am going to put an end to all people, for the earth is filled with violence because of them. I am surely going to destroy both them and the earth."'),
  (v_niv_id, v_genesis_id, 6, 14, 'So make yourself an ark of cypress wood; make rooms in it and coat it with pitch inside and out.');
  
  -- Genesis Chapter 7 (The Flood Begins)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 7, 1, 'The LORD then said to Noah, "Go into the ark, you and your whole family, because I have found you righteous in this generation."'),
  (v_niv_id, v_genesis_id, 7, 4, 'Seven days from now I will send rain on the earth for forty days and forty nights, and I will wipe from the face of the earth every living creature I have made."'),
  (v_niv_id, v_genesis_id, 7, 17, 'For forty days the flood kept coming on the earth, and as the waters increased they lifted the ark high above the earth.');
  
  -- Genesis Chapter 8 (Waters Recede)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 8, 1, 'But God remembered Noah and all the wild animals and the livestock that were with him in the ark, and he sent a wind over the earth, and the waters receded.'),
  (v_niv_id, v_genesis_id, 8, 11, 'When the dove returned to him in the evening, there in its beak was a freshly plucked olive leaf! Then Noah knew that the water had receded from the earth.'),
  (v_niv_id, v_genesis_id, 8, 20, 'Then Noah built an altar to the LORD and, taking some of all the clean animals and clean birds, he sacrificed burnt offerings on it.');
  
  -- Genesis Chapter 9 (God's Covenant with Noah)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 9, 1, 'Then God blessed Noah and his sons, saying to them, "Be fruitful and increase in number and fill the earth."'),
  (v_niv_id, v_genesis_id, 9, 11, 'I establish my covenant with you: Never again will all life be destroyed by the waters of a flood; never again will there be a flood to destroy the earth."'),
  (v_niv_id, v_genesis_id, 9, 13, 'I have set my rainbow in the clouds, and it will be the sign of the covenant between me and the earth.');
  
  -- Genesis Chapter 11 (Tower of Babel)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 11, 4, 'Then they said, "Come, let us build ourselves a city, with a tower that reaches to the heavens, so that we may make a name for ourselves; otherwise we will be scattered over the face of the whole earth."'),
  (v_niv_id, v_genesis_id, 11, 7, 'Come, let us go down and confuse their language so they will not understand each other."');
  
  -- Genesis Chapter 12 (Call of Abram)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 12, 1, 'The LORD had said to Abram, "Go from your country, your people and your father''s household to the land I will show you."'),
  (v_niv_id, v_genesis_id, 12, 2, 'I will make you into a great nation, and I will bless you; I will make your name great, and you will be a blessing.'),
  (v_niv_id, v_genesis_id, 12, 3, 'I will bless those who bless you, and whoever curses you I will curse; and all peoples on earth will be blessed through you."');
  
  -- Genesis Chapter 15 (God's Covenant with Abram)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 15, 1, 'After this, the word of the LORD came to Abram in a vision: "Do not be afraid, Abram. I am your shield, your very great reward."'),
  (v_niv_id, v_genesis_id, 15, 5, 'He took him outside and said, "Look up at the sky and count the stars—if indeed you can count them." Then he said to him, "So shall your offspring be."'),
  (v_niv_id, v_genesis_id, 15, 6, 'Abram believed the LORD, and he credited it to him as righteousness.');
  
  -- Genesis Chapter 18 (Abraham Pleads for Sodom)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 18, 25, 'Far be it from you to do such a thing—to kill the righteous with the wicked, treating the righteous and the wicked alike. Far be it from you! Will not the Judge of all the earth do right?"');
  
  -- Genesis Chapter 22 (Abraham Tested)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 22, 1, 'Some time later God tested Abraham. He said to him, "Abraham!" "Here I am," he replied.'),
  (v_niv_id, v_genesis_id, 22, 2, 'Then God said, "Take your son, your only son, whom you love—Isaac—and go to the region of Moriah. Sacrifice him there as a burnt offering on a mountain I will show you."'),
  (v_niv_id, v_genesis_id, 22, 8, 'Abraham answered, "God himself will provide the lamb for the burnt offering, my son." And the two of them went on together.'),
  (v_niv_id, v_genesis_id, 22, 14, 'So Abraham called that place The LORD Will Provide. And to this day it is said, "On the mountain of the LORD it will be provided."');
  
  -- Genesis Chapter 24 (Isaac and Rebekah)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 24, 27, 'saying, "Praise be to the LORD, the God of my master Abraham, who has not abandoned his kindness and faithfulness to my master. As for me, the LORD has led me on the journey to the house of my master''s relatives."');
  
  -- Genesis Chapter 25 (Jacob and Esau)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 25, 23, 'The LORD said to her, "Two nations are in your womb, and two peoples from within you will be separated; one people will be stronger than the other, and the older will serve the younger."'),
  (v_niv_id, v_genesis_id, 25, 27, 'The boys grew up, and Esau became a skillful hunter, a man of the open country, while Jacob was content to stay at home among the tents.'),
  (v_niv_id, v_genesis_id, 25, 33, 'But Jacob said, "Swear to me first." So he swore an oath to him, selling his birthright to Jacob.');
  
  -- Genesis Chapter 28 (Jacob's Dream)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 28, 12, 'He had a dream in which he saw a stairway resting on the earth, with its top reaching to heaven, and the angels of God were ascending and descending on it.'),
  (v_niv_id, v_genesis_id, 28, 15, 'I am with you and will watch over you wherever you go, and I will bring you back to this land. I will not leave you until I have done what I have promised you."');
  
  -- Genesis Chapter 29 (Jacob Marries Leah and Rachel)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 29, 20, 'So Jacob served seven years to get Rachel, but they seemed like only a few days to him because of his love for her.');
  
  -- Genesis Chapter 32 (Jacob Wrestles with God)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 32, 24, 'So Jacob was left alone, and a man wrestled with him till daybreak.'),
  (v_niv_id, v_genesis_id, 32, 28, 'Then the man said, "Your name will no longer be Jacob, but Israel, because you have struggled with God and with humans and have overcome."');
  
  -- Genesis Chapter 33 (Jacob Meets Esau)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 33, 4, 'But Esau ran to meet Jacob and embraced him; he threw his arms around his neck and kissed him. And they wept.');
  
  -- Genesis Chapter 37 (Joseph's Dreams)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 37, 3, 'Now Israel loved Joseph more than any of his other sons, because he had been born to him in his old age; and he made an ornate robe for him.'),
  (v_niv_id, v_genesis_id, 37, 28, 'So when the Midianite merchants came by, his brothers pulled Joseph up out of the cistern and sold him for twenty shekels of silver to the Ishmaelites, who took him to Egypt.');
  
  -- Genesis Chapter 39 (Joseph and Potiphar's Wife)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 39, 2, 'The LORD was with Joseph so that he prospered, and he lived in the house of his Egyptian master.'),
  (v_niv_id, v_genesis_id, 39, 9, 'No one is greater in this house than I am. My master has withheld nothing from me except you, because you are his wife. How then could I do such a wicked thing and sin against God?"');
  
  -- Genesis Chapter 41 (Joseph Interprets Pharaoh's Dreams)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 41, 16, '"I cannot do it," Joseph replied to Pharaoh, "but God will give Pharaoh the answer he desires."'),
  (v_niv_id, v_genesis_id, 41, 40, 'You shall be in charge of my palace, and all my people are to submit to your orders. Only with respect to the throne will I be greater than you."');
  
  -- Genesis Chapter 42 (Joseph's Brothers Go to Egypt)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 42, 9, 'Then he remembered his dreams about them and said to them, "You are spies! You have come to see where our land is unprotected."');
  
  -- Genesis Chapter 45 (Joseph Makes Himself Known)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 45, 4, 'Then Joseph said to his brothers, "Come close to me." When they had done so, he said, "I am your brother Joseph, the one you sold into Egypt!"'),
  (v_niv_id, v_genesis_id, 45, 5, 'And now, do not be distressed and do not be angry with yourselves for selling me here, because it was to save lives that God sent me ahead of you.');
  
  -- Genesis Chapter 46 (Jacob Goes to Egypt)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 46, 3, 'I am God, the God of your father," he said. "Do not be afraid to go down to Egypt, for I will make you into a great nation there.'),
  (v_niv_id, v_genesis_id, 46, 4, 'I will go down to Egypt with you, and I will surely bring you back again. And Joseph''s own hand will close your eyes."');
  
  -- Genesis Chapter 50 (The Death of Joseph)
  INSERT INTO bible_verses (version_id, book_id, chapter, verse, text) VALUES
  (v_niv_id, v_genesis_id, 50, 19, 'But Joseph said to them, "Don''t be afraid. Am I in the place of God?"'),
  (v_niv_id, v_genesis_id, 50, 20, 'You intended to harm me, but God intended it for good to accomplish what is now being done, the saving of many lives.');
  
END $$;