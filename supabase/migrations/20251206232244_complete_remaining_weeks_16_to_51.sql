/*
  # Complete Remaining Weeks 16-51
  
  Fills in all remaining weeks with actual scripture references:
  - Weeks 16-22: 1-2 Kings, Psalms, Proverbs
  - Weeks 23-30: Chronicles, Wisdom Books, Early Prophets  
  - Weeks 31-36: Major & Minor Prophets
  - Weeks 38-42: Gospel Harmony
  - Weeks 43-45: Acts
  - Weeks 46-51: Epistles
*/

DO $$
BEGIN

  -- ============================================================================
  -- WEEKS 16-22: KINGS, PSALMS, PROVERBS (Days 106-154)
  -- ============================================================================

  -- Week 16: Elijah & Elisha
  UPDATE daily_readings SET scripture_references = ARRAY['1 Kings 21:1-22:53'], title = 'Naboth''s Vineyard, Ahab Dies' WHERE week_number = 16 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Kings 1:1-3:27'], title = 'Elijah Taken Up, Elisha' WHERE week_number = 16 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Kings 4:1-6:23'], title = 'Elisha''s Miracles' WHERE week_number = 16 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Kings 6:24-9:37'], title = 'Siege, Jehu''s Revolt' WHERE week_number = 16 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Kings 10:1-12:21'], title = 'Jehu''s Purge, Joash' WHERE week_number = 16 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Kings 13:1-15:38'], title = 'Israel''s Decline' WHERE week_number = 16 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Kings 16:1-18:37'], title = 'Ahaz, Hoshea, Israel Falls' WHERE week_number = 16 AND day_number = 7;

  -- Week 17: Hezekiah, Josiah
  UPDATE daily_readings SET scripture_references = ARRAY['2 Kings 19:1-21:26'], title = 'Hezekiah''s Prayer, Manasseh' WHERE week_number = 17 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Kings 22:1-23:37'], title = 'Josiah''s Reforms' WHERE week_number = 17 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Kings 24:1-25:30'], title = 'Judah Falls to Babylon' WHERE week_number = 17 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 1-8'], title = 'Blessed, God''s Glory' WHERE week_number = 17 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 9-16'], title = 'God is Refuge' WHERE week_number = 17 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 17-22'], title = 'My God, Why Forsaken?' WHERE week_number = 17 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 23-30'], title = 'The Lord is My Shepherd' WHERE week_number = 17 AND day_number = 7;

  -- Week 18: More Psalms
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 31-37'], title = 'Trust in the Lord' WHERE week_number = 18 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 38-44'], title = 'Waiting on God' WHERE week_number = 18 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 45-51'], title = 'Create in Me Clean Heart' WHERE week_number = 18 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 52-59'], title = 'God is My Fortress' WHERE week_number = 18 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 60-67'], title = 'In God We Trust' WHERE week_number = 18 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 68-72'], title = 'Blessed Be the Lord' WHERE week_number = 18 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 73-77'], title = 'God is My Strength' WHERE week_number = 18 AND day_number = 7;

  -- Week 19: Psalms Continue
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 78-82'], title = 'Remember God''s Works' WHERE week_number = 19 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 83-89'], title = 'God''s Faithfulness' WHERE week_number = 19 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 90-96'], title = 'Our Dwelling Place' WHERE week_number = 19 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 97-104'], title = 'The Lord Reigns' WHERE week_number = 19 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 105-107'], title = 'Give Thanks' WHERE week_number = 19 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 108-115'], title = 'Not to Us, O Lord' WHERE week_number = 19 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 116-118'], title = 'This is the Day' WHERE week_number = 19 AND day_number = 7;

  -- Week 20: Psalm 119 & Proverbs
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 119:1-88'], title = 'Your Word is a Lamp' WHERE week_number = 20 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 119:89-176'], title = 'I Love Your Law' WHERE week_number = 20 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 120-132'], title = 'Songs of Ascent' WHERE week_number = 20 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 133-139'], title = 'Search Me, O God' WHERE week_number = 20 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Psalm 140-150'], title = 'Praise the Lord!' WHERE week_number = 20 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Proverbs 1:1-3:35'], title = 'Beginning of Wisdom' WHERE week_number = 20 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Proverbs 4:1-7:27'], title = 'Get Wisdom, Get Understanding' WHERE week_number = 20 AND day_number = 7;

  -- Week 21: Proverbs
  UPDATE daily_readings SET scripture_references = ARRAY['Proverbs 8:1-11:31'], title = 'Wisdom Calls Out' WHERE week_number = 21 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Proverbs 12:1-15:33'], title = 'Wise Son, Foolish Son' WHERE week_number = 21 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Proverbs 16:1-19:29'], title = 'Pride Before Fall' WHERE week_number = 21 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Proverbs 20:1-23:35'], title = 'King''s Heart, Wine Mocker' WHERE week_number = 21 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Proverbs 24:1-27:27'], title = 'Do Not Boast' WHERE week_number = 21 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Proverbs 28:1-31:31'], title = 'Virtuous Woman' WHERE week_number = 21 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Ecclesiastes 1:1-3:22'], title = 'Meaningless, Time for Everything' WHERE week_number = 21 AND day_number = 7;

  -- Week 22: Ecclesiastes & Song of Songs
  UPDATE daily_readings SET scripture_references = ARRAY['Ecclesiastes 4:1-8:17'], title = 'Two Better Than One' WHERE week_number = 22 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Ecclesiastes 9:1-12:14'], title = 'Fear God, Keep Commands' WHERE week_number = 22 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Song of Solomon 1:1-8:14'], title = 'Love Songs' WHERE week_number = 22 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Chronicles 1:1-3:24'], title = 'Genealogies from Adam' WHERE week_number = 22 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Chronicles 4:1-7:40'], title = 'More Genealogies' WHERE week_number = 22 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Chronicles 8:1-10:14'], title = 'Saul''s Death Retold' WHERE week_number = 22 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Chronicles 11:1-14:17'], title = 'David Becomes King' WHERE week_number = 22 AND day_number = 7;

  -- ============================================================================
  -- WEEKS 23-30: CHRONICLES, WISDOM, EARLY PROPHETS (Days 155-210)
  -- ============================================================================

  -- Week 23: Chronicles
  UPDATE daily_readings SET scripture_references = ARRAY['1 Chronicles 15:1-17:27'], title = 'Ark to Jerusalem, Covenant' WHERE week_number = 23 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Chronicles 18:1-22:19'], title = 'David''s Victories, Temple Plans' WHERE week_number = 23 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Chronicles 23:1-26:32'], title = 'Levites Organized' WHERE week_number = 23 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Chronicles 27:1-29:30'], title = 'David''s Officials, Death' WHERE week_number = 23 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Chronicles 1:1-5:14'], title = 'Solomon''s Wisdom, Temple' WHERE week_number = 23 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Chronicles 6:1-8:18'], title = 'Temple Dedicated' WHERE week_number = 23 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Chronicles 9:1-12:16'], title = 'Queen of Sheba, Rehoboam' WHERE week_number = 23 AND day_number = 7;

  -- Week 24: Chronicles Middle
  UPDATE daily_readings SET scripture_references = ARRAY['2 Chronicles 13:1-17:19'], title = 'Abijah, Asa, Jehoshaphat' WHERE week_number = 24 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Chronicles 18:1-22:12'], title = 'Jehoshaphat''s Allies, Jehoram' WHERE week_number = 24 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Chronicles 23:1-26:23'], title = 'Joash, Amaziah, Uzziah' WHERE week_number = 24 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Chronicles 27:1-30:27'], title = 'Jotham, Ahaz, Hezekiah' WHERE week_number = 24 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Chronicles 31:1-34:33'], title = 'Hezekiah''s Reform, Josiah' WHERE week_number = 24 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Chronicles 35:1-36:23'], title = 'Josiah''s Passover, Exile' WHERE week_number = 24 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Ezra 1:1-4:24'], title = 'Return from Exile' WHERE week_number = 24 AND day_number = 7;

  -- Week 25: Ezra, Nehemiah
  UPDATE daily_readings SET scripture_references = ARRAY['Ezra 5:1-10:44'], title = 'Temple Rebuilt, Ezra''s Mission' WHERE week_number = 25 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Nehemiah 1:1-4:23'], title = 'Walls Rebuilt' WHERE week_number = 25 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Nehemiah 5:1-8:18'], title = 'Opposition, Reading Law' WHERE week_number = 25 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Nehemiah 9:1-11:36'], title = 'Confession, Covenant Renewed' WHERE week_number = 25 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Nehemiah 12:1-13:31'], title = 'Dedication, Reforms' WHERE week_number = 25 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Esther 1:1-5:14'], title = 'Esther Becomes Queen' WHERE week_number = 25 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Esther 6:1-10:3'], title = 'Jews Delivered' WHERE week_number = 25 AND day_number = 7;

  -- Week 26-30: Isaiah, Jeremiah (chronologically placed)
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 1:1-6:13'], title = 'Isaiah''s Call, Vision' WHERE week_number = 26 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 7:1-12:6'], title = 'Immanuel, Branch of Jesse' WHERE week_number = 26 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 13:1-18:7'], title = 'Oracles Against Nations' WHERE week_number = 26 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 19:1-23:18'], title = 'More Prophecies' WHERE week_number = 26 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 24:1-27:13'], title = 'God''s Judgment, Salvation' WHERE week_number = 26 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 28:1-31:9'], title = 'Woe to Ephraim' WHERE week_number = 26 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 32:1-35:10'], title = 'Coming Kingdom' WHERE week_number = 26 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 36:1-40:31'], title = 'Hezekiah, Comfort My People' WHERE week_number = 27 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 41:1-44:23'], title = 'Fear Not, I Am With You' WHERE week_number = 27 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 44:24-48:22'], title = 'Cyrus, Babylon Falls' WHERE week_number = 27 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 49:1-52:12'], title = 'Servant Songs' WHERE week_number = 27 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 52:13-57:21'], title = 'Suffering Servant' WHERE week_number = 27 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 58:1-62:12'], title = 'True Fasting, Arise Shine' WHERE week_number = 27 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 63:1-66:24'], title = 'New Heavens, New Earth' WHERE week_number = 27 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Jeremiah 1:1-4:31'], title = 'Jeremiah Called' WHERE week_number = 28 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Jeremiah 5:1-8:22'], title = 'Judgment Proclaimed' WHERE week_number = 28 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Jeremiah 9:1-12:17'], title = 'Weeping Prophet' WHERE week_number = 28 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Jeremiah 13:1-17:27'], title = 'Linen Belt, Potter''s House' WHERE week_number = 28 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Jeremiah 18:1-23:40'], title = 'Potter, False Prophets' WHERE week_number = 28 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Jeremiah 24:1-29:32'], title = 'Two Baskets, Letter to Exiles' WHERE week_number = 28 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Jeremiah 30:1-33:26'], title = 'New Covenant Promised' WHERE week_number = 28 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Jeremiah 34:1-39:18'], title = 'Siege of Jerusalem' WHERE week_number = 29 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Jeremiah 40:1-45:5'], title = 'After the Fall' WHERE week_number = 29 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Jeremiah 46:1-49:39'], title = 'Prophecies Against Nations' WHERE week_number = 29 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Jeremiah 50:1-51:64'], title = 'Babylon Will Fall' WHERE week_number = 29 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Jeremiah 52:1-34', 'Lamentations 1:1-2:22'], title = 'Fall Retold, Lamentations' WHERE week_number = 29 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Lamentations 3:1-5:22'], title = 'Yet Hope in God' WHERE week_number = 29 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Ezekiel 1:1-4:17'], title = 'Ezekiel''s Visions Begin' WHERE week_number = 29 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Ezekiel 5:1-8:18'], title = 'Judgment on Jerusalem' WHERE week_number = 30 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Ezekiel 9:1-12:28'], title = 'Glory Departs' WHERE week_number = 30 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Ezekiel 13:1-16:63'], title = 'False Prophets, Unfaithful Wife' WHERE week_number = 30 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Ezekiel 17:1-20:49'], title = 'Eagles, Rebellious House' WHERE week_number = 30 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Ezekiel 21:1-24:27'], title = 'Sword of the Lord' WHERE week_number = 30 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Ezekiel 25:1-28:26'], title = 'Prophecies Against Nations' WHERE week_number = 30 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Ezekiel 29:1-32:32'], title = 'Egypt Will Fall' WHERE week_number = 30 AND day_number = 7;

  -- ============================================================================
  -- WEEKS 31-36: EZEKIEL, DANIEL, MINOR PROPHETS (Days 211-252)
  -- ============================================================================

  UPDATE daily_readings SET scripture_references = ARRAY['Ezekiel 33:1-36:38'], title = 'Watchman, Dry Bones Live' WHERE week_number = 31 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Ezekiel 37:1-40:49'], title = 'Valley of Dry Bones, Temple' WHERE week_number = 31 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Ezekiel 41:1-44:31'], title = 'Temple Measurements' WHERE week_number = 31 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Ezekiel 45:1-48:35'], title = 'Land Divided, River of Life' WHERE week_number = 31 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Daniel 1:1-3:30'], title = 'Daniel, Fiery Furnace' WHERE week_number = 31 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Daniel 4:1-6:28'], title = 'Nebuchadnezzar''s Dream, Lions'' Den' WHERE week_number = 31 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Daniel 7:1-9:27'], title = 'Four Beasts, Seventy Weeks' WHERE week_number = 31 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Daniel 10:1-12:13'], title = 'Final Vision, End Times' WHERE week_number = 32 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Hosea 1:1-7:16'], title = 'Hosea''s Unfaithful Wife' WHERE week_number = 32 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Hosea 8:1-14:9'], title = 'Return to the Lord' WHERE week_number = 32 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Joel 1:1-3:21'], title = 'Day of the Lord, Spirit Poured Out' WHERE week_number = 32 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Amos 1:1-5:27'], title = 'Amos'' Judgment Oracles' WHERE week_number = 32 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Amos 6:1-9:15'], title = 'Woe to the Complacent' WHERE week_number = 32 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Obadiah 1:1-21', 'Jonah 1:1-4:11'], title = 'Obadiah, Jonah and Nineveh' WHERE week_number = 32 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Micah 1:1-7:20'], title = 'Micah: Justice, Mercy, Humble' WHERE week_number = 33 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Nahum 1:1-3:19'], title = 'Nineveh Will Fall' WHERE week_number = 33 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Habakkuk 1:1-3:19'], title = 'Just Shall Live by Faith' WHERE week_number = 33 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Zephaniah 1:1-3:20'], title = 'Day of the Lord Coming' WHERE week_number = 33 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Haggai 1:1-2:23'], title = 'Rebuild the Temple' WHERE week_number = 33 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Zechariah 1:1-6:15'], title = 'Visions of Zechariah' WHERE week_number = 33 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Zechariah 7:1-11:17'], title = 'True Justice, Good Shepherd' WHERE week_number = 33 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Zechariah 12:1-14:21'], title = 'They Will Look on Me, Living Water' WHERE week_number = 34 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Malachi 1:1-4:6'], title = 'Messenger of the Covenant' WHERE week_number = 34 AND day_number = 2;
  -- Days 3-7 of week 34 reserved for gospel transition/review
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 1:1-17', 'Luke 3:23-38'], title = 'Genealogies of Jesus' WHERE week_number = 34 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 3:1-17', 'Mark 1:1-11', 'Luke 3:1-22'], title = 'John the Baptist' WHERE week_number = 34 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 4:1-11', 'Mark 1:12-13', 'Luke 4:1-13'], title = 'Temptation of Jesus' WHERE week_number = 34 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['John 1:1-51'], title = 'The Word Became Flesh' WHERE week_number = 34 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['John 2:1-4:54'], title = 'First Sign, Nicodemus, Woman at Well' WHERE week_number = 34 AND day_number = 7;

  -- Week 35-36: Transition and Gospel Beginnings
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 4:12-25', 'Mark 1:14-20', 'Luke 4:14-44'], title = 'Ministry Begins in Galilee' WHERE week_number = 35 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 5:1-48'], title = 'Sermon: Beatitudes, Salt & Light' WHERE week_number = 35 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 6:1-7:29'], title = 'Lord''s Prayer, Do Not Worry' WHERE week_number = 35 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 8:1-9:38', 'Luke 7:1-50'], title = 'Healing Miracles' WHERE week_number = 35 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 10:1-11:30'], title = 'Twelve Sent Out' WHERE week_number = 35 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 12:1-50', 'Mark 3:1-35'], title = 'Lord of the Sabbath' WHERE week_number = 35 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 13:1-58', 'Mark 4:1-34'], title = 'Parables of the Kingdom' WHERE week_number = 35 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Mark 4:35-6:6', 'Luke 8:22-56'], title = 'Storm Calmed, Jairus'' Daughter' WHERE week_number = 36 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 14:1-36', 'Mark 6:7-56', 'John 6:1-21'], title = '5000 Fed, Walking on Water' WHERE week_number = 36 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['John 6:22-71'], title = 'Bread of Life' WHERE week_number = 36 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 15:1-16:28', 'Mark 7:1-8:38'], title = 'Peter''s Confession' WHERE week_number = 36 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 17:1-27', 'Mark 9:1-50', 'Luke 9:28-62'], title = 'Transfiguration' WHERE week_number = 36 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 18:1-35'], title = 'Greatest in Kingdom, Forgiveness' WHERE week_number = 36 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['John 7:1-8:59'], title = 'Feast of Tabernacles, Light of World' WHERE week_number = 36 AND day_number = 7;

  -- ============================================================================
  -- WEEKS 38-42: GOSPEL HARMONY CONTINUES (Days 260-294)
  -- ============================================================================

  UPDATE daily_readings SET scripture_references = ARRAY['John 9:1-10:42'], title = 'Blind Man Healed, Good Shepherd' WHERE week_number = 38 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Luke 10:1-11:54'], title = 'Good Samaritan, Mary & Martha' WHERE week_number = 38 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Luke 12:1-13:35'], title = 'Do Not Worry, Narrow Door' WHERE week_number = 38 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Luke 14:1-15:32'], title = 'Lost Sheep, Prodigal Son' WHERE week_number = 38 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Luke 16:1-17:37'], title = 'Rich Man & Lazarus' WHERE week_number = 38 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Luke 18:1-19:27'], title = 'Persistent Widow, Zacchaeus' WHERE week_number = 38 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['John 11:1-57'], title = 'Lazarus Raised' WHERE week_number = 38 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 19:1-20:34', 'Mark 10:1-52'], title = 'Rich Young Man, Blind Bartimaeus' WHERE week_number = 39 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 21:1-27', 'Mark 11:1-33', 'Luke 19:28-48'], title = 'Triumphal Entry' WHERE week_number = 39 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 21:28-22:46', 'Mark 12:1-44'], title = 'Parables, Greatest Commandment' WHERE week_number = 39 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 23:1-24:51', 'Mark 13:1-37'], title = 'Olivet Discourse' WHERE week_number = 39 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 25:1-26:16', 'Luke 21:1-22:6'], title = 'Ten Virgins, Sheep & Goats' WHERE week_number = 39 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['John 12:1-50'], title = 'Mary Anoints Jesus' WHERE week_number = 39 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['John 13:1-38'], title = 'Washing Feet, New Command' WHERE week_number = 39 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['John 14:1-16:33'], title = 'I Am the Way, Vine & Branches' WHERE week_number = 40 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['John 17:1-26'], title = 'High Priestly Prayer' WHERE week_number = 40 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 26:17-56', 'Mark 14:12-52', 'Luke 22:7-53'], title = 'Last Supper, Gethsemane' WHERE week_number = 40 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 26:57-27:26', 'Mark 14:53-15:15', 'John 18:12-19:16'], title = 'Trials of Jesus' WHERE week_number = 40 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 27:27-66', 'Mark 15:16-47', 'Luke 23:26-56', 'John 19:17-42'], title = 'Crucifixion' WHERE week_number = 40 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 28:1-20', 'Mark 16:1-20', 'Luke 24:1-49'], title = 'Resurrection!' WHERE week_number = 40 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['John 20:1-21:25'], title = 'Thomas, Breakfast on Beach' WHERE week_number = 40 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Acts 1:1-26'], title = 'Ascension, Matthias Chosen' WHERE week_number = 41 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 2:1-47'], title = 'Pentecost, Spirit Falls' WHERE week_number = 41 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 3:1-4:37'], title = 'Lame Man Healed, Peter & John Arrested' WHERE week_number = 41 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 5:1-6:15'], title = 'Ananias & Sapphira, Seven Chosen' WHERE week_number = 41 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 7:1-60'], title = 'Stephen''s Speech, Martyrdom' WHERE week_number = 41 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 8:1-40'], title = 'Philip, Ethiopian Eunuch' WHERE week_number = 41 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 9:1-43'], title = 'Saul''s Conversion' WHERE week_number = 41 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Acts 10:1-11:18'], title = 'Peter & Cornelius' WHERE week_number = 42 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 11:19-12:25'], title = 'Antioch Church, Peter Freed' WHERE week_number = 42 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 13:1-52'], title = 'First Missionary Journey Begins' WHERE week_number = 42 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 14:1-15:35'], title = 'Iconium, Jerusalem Council' WHERE week_number = 42 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 15:36-16:40'], title = 'Second Journey, Lydia, Jailer' WHERE week_number = 42 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 17:1-18:22'], title = 'Thessalonica, Athens, Corinth' WHERE week_number = 42 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 18:23-19:41'], title = 'Third Journey, Ephesus' WHERE week_number = 42 AND day_number = 7;

  -- ============================================================================
  -- WEEKS 43-45: ACTS COMPLETES (Days 295-315)
  -- ============================================================================

  UPDATE daily_readings SET scripture_references = ARRAY['Acts 20:1-38'], title = 'Troas, Ephesian Elders' WHERE week_number = 43 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 21:1-40'], title = 'Jerusalem, Paul Arrested' WHERE week_number = 43 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 22:1-23:35'], title = 'Paul''s Defense, Plot Discovered' WHERE week_number = 43 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 24:1-25:27'], title = 'Before Felix, Festus' WHERE week_number = 43 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 26:1-32'], title = 'Before Agrippa' WHERE week_number = 43 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 27:1-44'], title = 'Voyage to Rome, Shipwreck' WHERE week_number = 43 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Acts 28:1-31'], title = 'Malta, Rome' WHERE week_number = 43 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Romans 1:1-3:20'], title = 'All Have Sinned' WHERE week_number = 44 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Romans 3:21-5:21'], title = 'Justified by Faith' WHERE week_number = 44 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Romans 6:1-8:39'], title = 'Dead to Sin, Life in Spirit' WHERE week_number = 44 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Romans 9:1-11:36'], title = 'Israel''s Future' WHERE week_number = 44 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Romans 12:1-16:27'], title = 'Living Sacrifice, Love' WHERE week_number = 44 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['James 1:1-5:20'], title = 'Faith and Works' WHERE week_number = 44 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Galatians 1:1-3:29'], title = 'Gospel of Grace' WHERE week_number = 44 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Galatians 4:1-6:18'], title = 'Freedom in Christ' WHERE week_number = 45 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Thessalonians 1:1-5:28'], title = 'Christ''s Return' WHERE week_number = 45 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Thessalonians 1:1-3:18'], title = 'Day of the Lord' WHERE week_number = 45 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Corinthians 1:1-4:21'], title = 'Divisions in Church' WHERE week_number = 45 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Corinthians 5:1-8:13'], title = 'Immorality, Lawsuits, Food' WHERE week_number = 45 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Corinthians 9:1-11:34'], title = 'Rights, Lord''s Supper' WHERE week_number = 45 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Corinthians 12:1-14:40'], title = 'Spiritual Gifts, Love' WHERE week_number = 45 AND day_number = 7;

  -- ============================================================================
  -- WEEKS 46-51: EPISTLES CONTINUE (Days 316-357)
  -- ============================================================================

  UPDATE daily_readings SET scripture_references = ARRAY['1 Corinthians 15:1-16:24'], title = 'Resurrection Chapter' WHERE week_number = 46 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Corinthians 1:1-4:18'], title = 'Comfort, New Covenant' WHERE week_number = 46 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Corinthians 5:1-9:15'], title = 'Ambassadors, Generosity' WHERE week_number = 46 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Corinthians 10:1-13:14'], title = 'Paul''s Defense' WHERE week_number = 46 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Ephesians 1:1-3:21'], title = 'Spiritual Blessings' WHERE week_number = 46 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Ephesians 4:1-6:24'], title = 'Unity, Armor of God' WHERE week_number = 46 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Philippians 1:1-4:23'], title = 'Joy, Humility of Christ' WHERE week_number = 46 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Colossians 1:1-4:18'], title = 'Supremacy of Christ' WHERE week_number = 47 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Philemon 1:1-25', '1 Timothy 1:1-3:16'], title = 'Philemon, Church Leadership' WHERE week_number = 47 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Timothy 4:1-6:21'], title = 'Godliness, Love of Money' WHERE week_number = 47 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Titus 1:1-3:15'], title = 'Sound Doctrine' WHERE week_number = 47 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['2 Timothy 1:1-4:22'], title = 'Guard the Truth, Finish Race' WHERE week_number = 47 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Peter 1:1-3:22'], title = 'Living Hope, Suffering' WHERE week_number = 47 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Peter 4:1-5:14'], title = 'Shepherd the Flock' WHERE week_number = 47 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['2 Peter 1:1-3:18'], title = 'False Teachers, Day of Lord' WHERE week_number = 48 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Jude 1:1-25', '1 John 1:1-2:29'], title = 'Contend for Faith, Walk in Light' WHERE week_number = 48 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['1 John 3:1-5:21'], title = 'Children of God, Love One Another' WHERE week_number = 48 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['2 John 1:1-13', '3 John 1:1-14'], title = 'Walk in Truth, Love' WHERE week_number = 48 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Hebrews 1:1-4:13'], title = 'Son Superior, Rest Remains' WHERE week_number = 48 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Hebrews 4:14-7:28'], title = 'Great High Priest, Melchizedek' WHERE week_number = 48 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Hebrews 8:1-10:39'], title = 'New Covenant, Once for All' WHERE week_number = 48 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Hebrews 11:1-40'], title = 'Hall of Faith' WHERE week_number = 49 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Hebrews 12:1-13:25'], title = 'Run with Endurance' WHERE week_number = 49 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['Revelation 1:1-3:22'], title = 'Seven Churches' WHERE week_number = 49 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Revelation 4:1-7:17'], title = 'Throne Room, Seven Seals' WHERE week_number = 49 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Revelation 8:1-11:19'], title = 'Seven Trumpets' WHERE week_number = 49 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Revelation 12:1-14:20'], title = 'Woman, Dragon, Beasts' WHERE week_number = 49 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Revelation 15:1-18:24'], title = 'Seven Bowls, Babylon Falls' WHERE week_number = 49 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Revelation 19:1-20:15'], title = 'Christ Returns, Final Judgment' WHERE week_number = 50 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Revelation 21:1-22:21'], title = 'New Heaven and Earth' WHERE week_number = 50 AND day_number = 2;
  -- Remaining days for review/catch-up
  UPDATE daily_readings SET scripture_references = ARRAY['Genesis 1:1-2:3'], title = 'Review: Creation' WHERE week_number = 50 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Exodus 12:1-13:16'], title = 'Review: Passover' WHERE week_number = 50 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Isaiah 52:13-53:12'], title = 'Review: Suffering Servant' WHERE week_number = 50 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Matthew 5:1-7:29'], title = 'Review: Sermon on Mount' WHERE week_number = 50 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['John 3:1-21'], title = 'Review: Born Again' WHERE week_number = 50 AND day_number = 7;

  UPDATE daily_readings SET scripture_references = ARRAY['Romans 3:21-5:21'], title = 'Review: Justification' WHERE week_number = 51 AND day_number = 1;
  UPDATE daily_readings SET scripture_references = ARRAY['Romans 8:1-39'], title = 'Review: No Condemnation' WHERE week_number = 51 AND day_number = 2;
  UPDATE daily_readings SET scripture_references = ARRAY['1 Corinthians 13:1-13'], title = 'Review: Love Chapter' WHERE week_number = 51 AND day_number = 3;
  UPDATE daily_readings SET scripture_references = ARRAY['Ephesians 2:1-10'], title = 'Review: Saved by Grace' WHERE week_number = 51 AND day_number = 4;
  UPDATE daily_readings SET scripture_references = ARRAY['Philippians 2:1-11'], title = 'Review: Christ''s Humility' WHERE week_number = 51 AND day_number = 5;
  UPDATE daily_readings SET scripture_references = ARRAY['Hebrews 11:1-40'], title = 'Review: Faith Heroes' WHERE week_number = 51 AND day_number = 6;
  UPDATE daily_readings SET scripture_references = ARRAY['Revelation 21:1-22:21'], title = 'Review: New Creation' WHERE week_number = 51 AND day_number = 7;

END $$;
