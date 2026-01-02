/*
  # Add Verse of the Day Feature

  1. New Tables
    - `daily_verses`
      - `id` (uuid, primary key)
      - `date` (date, unique) - The date this verse is for
      - `reference` (text) - Bible reference (e.g., "Philippians 4:13")
      - `text` (text) - The verse text
      - `theme` (text) - Theme/topic of the verse
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `daily_verses` table
    - Add policy for all users to read verses
    - Only authenticated users can see verses
  
  3. Sample Data
    - Populate with 30 days of youth-relevant verses
    - Topics: courage, identity, purpose, faith, strength, hope
*/

CREATE TABLE IF NOT EXISTS daily_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  reference text NOT NULL,
  text text NOT NULL,
  theme text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily verses"
  ON daily_verses
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert 30 days of youth-relevant verses starting from today
INSERT INTO daily_verses (date, reference, text, theme) VALUES
  (CURRENT_DATE, 'Philippians 4:13', 'I can do all things through Christ who strengthens me.', 'Strength'),
  (CURRENT_DATE + INTERVAL '1 day', 'Jeremiah 29:11', 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', 'Purpose'),
  (CURRENT_DATE + INTERVAL '2 days', 'Proverbs 3:5-6', 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', 'Trust'),
  (CURRENT_DATE + INTERVAL '3 days', 'Joshua 1:9', 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', 'Courage'),
  (CURRENT_DATE + INTERVAL '4 days', 'Psalm 139:14', 'I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.', 'Identity'),
  (CURRENT_DATE + INTERVAL '5 days', '1 Timothy 4:12', 'Don''t let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity.', 'Youth'),
  (CURRENT_DATE + INTERVAL '6 days', 'Psalm 119:105', 'Your word is a lamp for my feet, a light on my path.', 'Guidance'),
  (CURRENT_DATE + INTERVAL '7 days', 'Romans 12:2', 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.', 'Transformation'),
  (CURRENT_DATE + INTERVAL '8 days', 'Isaiah 40:31', 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.', 'Hope'),
  (CURRENT_DATE + INTERVAL '9 days', 'Matthew 5:16', 'Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.', 'Witness'),
  (CURRENT_DATE + INTERVAL '10 days', 'Proverbs 4:23', 'Above all else, guard your heart, for everything you do flows from it.', 'Wisdom'),
  (CURRENT_DATE + INTERVAL '11 days', '2 Corinthians 5:17', 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!', 'Identity'),
  (CURRENT_DATE + INTERVAL '12 days', 'Ephesians 2:10', 'For we are God''s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.', 'Purpose'),
  (CURRENT_DATE + INTERVAL '13 days', 'Psalm 46:1', 'God is our refuge and strength, an ever-present help in trouble.', 'Strength'),
  (CURRENT_DATE + INTERVAL '14 days', 'James 1:2-3', 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.', 'Perseverance'),
  (CURRENT_DATE + INTERVAL '15 days', 'Colossians 3:23', 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.', 'Excellence'),
  (CURRENT_DATE + INTERVAL '16 days', 'Psalm 37:4', 'Take delight in the Lord, and he will give you the desires of your heart.', 'Desires'),
  (CURRENT_DATE + INTERVAL '17 days', 'Hebrews 11:1', 'Now faith is confidence in what we hope for and assurance about what we do not see.', 'Faith'),
  (CURRENT_DATE + INTERVAL '18 days', 'Proverbs 22:6', 'Start children off on the way they should go, and even when they are old they will not turn from it.', 'Foundation'),
  (CURRENT_DATE + INTERVAL '19 days', '1 Corinthians 15:58', 'Therefore, my dear brothers and sisters, stand firm. Let nothing move you. Always give yourselves fully to the work of the Lord.', 'Dedication'),
  (CURRENT_DATE + INTERVAL '20 days', 'Matthew 6:33', 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.', 'Priorities'),
  (CURRENT_DATE + INTERVAL '21 days', 'Romans 8:28', 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.', 'Trust'),
  (CURRENT_DATE + INTERVAL '22 days', 'Galatians 5:22-23', 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.', 'Character'),
  (CURRENT_DATE + INTERVAL '23 days', 'Psalm 27:1', 'The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?', 'Courage'),
  (CURRENT_DATE + INTERVAL '24 days', 'John 15:5', 'I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing.', 'Connection'),
  (CURRENT_DATE + INTERVAL '25 days', 'Proverbs 16:3', 'Commit to the Lord whatever you do, and he will establish your plans.', 'Guidance'),
  (CURRENT_DATE + INTERVAL '26 days', 'Isaiah 41:10', 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.', 'Comfort'),
  (CURRENT_DATE + INTERVAL '27 days', '2 Timothy 1:7', 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.', 'Confidence'),
  (CURRENT_DATE + INTERVAL '28 days', 'Micah 6:8', 'He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.', 'Justice'),
  (CURRENT_DATE + INTERVAL '29 days', 'Psalm 119:9', 'How can a young person stay on the path of purity? By living according to your word.', 'Purity')
ON CONFLICT (date) DO NOTHING;