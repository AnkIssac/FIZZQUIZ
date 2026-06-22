// Offline media questions for the Image, Cropped-Image and Audio rounds.
// No external APIs: "images" are large emoji pictograms (blur/zoom on the client)
// and "audio" clips are short melodies synthesized in the browser via Web Audio.

// Pictograms — used by both the Image round (blur reveal) and Cropped round (zoom out).
export const pictogramQuestions = [
  { emoji: '🗼', q: 'Which famous landmark is shown?', o: ['Eiffel Tower', 'Big Ben', 'Tokyo Tower', 'Space Needle'], c: 0, e: 'The Eiffel Tower stands in Paris.' },
  { emoji: '🗽', q: 'Which monument is this?', o: ['Christ the Redeemer', 'Statue of Liberty', 'The Sphinx', 'Motherland Calls'], c: 1, e: 'The Statue of Liberty stands in New York Harbor.' },
  { emoji: '🐘', q: 'Which animal is shown?', o: ['Rhinoceros', 'Hippo', 'Elephant', 'Mammoth'], c: 2, e: 'It is an elephant — the largest land animal.' },
  { emoji: '🦒', q: 'Which animal is this?', o: ['Giraffe', 'Camel', 'Llama', 'Horse'], c: 0, e: 'The giraffe is the tallest animal.' },
  { emoji: '🍕', q: 'Which food is shown?', o: ['Burger', 'Pizza', 'Taco', 'Sandwich'], c: 1, e: 'A slice of pizza, born in Italy.' },
  { emoji: '🍣', q: 'Which dish is this?', o: ['Dumplings', 'Sushi', 'Spring rolls', 'Noodles'], c: 1, e: 'Sushi originated in Japan.' },
  { emoji: '🪕', q: 'Which musical instrument is shown?', o: ['Guitar', 'Banjo', 'Sitar', 'Violin'], c: 1, e: 'It is a banjo.' },
  { emoji: '🎸', q: 'Which instrument is this?', o: ['Guitar', 'Ukulele', 'Harp', 'Cello'], c: 0, e: 'An electric guitar.' },
  { emoji: '🚀', q: 'What is shown?', o: ['Airplane', 'Rocket', 'Submarine', 'Helicopter'], c: 1, e: 'A rocket, used for space travel.' },
  { emoji: '⚽', q: 'Which sport uses this ball?', o: ['Basketball', 'Football (soccer)', 'Volleyball', 'Tennis'], c: 1, e: 'A football (soccer ball).' },
  { emoji: '🏏', q: 'Which sport is this equipment from?', o: ['Baseball', 'Cricket', 'Hockey', 'Golf'], c: 1, e: 'A cricket bat and ball.' },
  { emoji: '🌋', q: 'What natural feature is shown?', o: ['Mountain', 'Volcano', 'Glacier', 'Canyon'], c: 1, e: 'An erupting volcano.' },
  { emoji: '🦋', q: 'Which creature is this?', o: ['Moth', 'Butterfly', 'Dragonfly', 'Bee'], c: 1, e: 'A butterfly.' },
  { emoji: '🕌', q: 'Which kind of building is shown?', o: ['Church', 'Mosque', 'Temple', 'Pagoda'], c: 1, e: 'A mosque, with its dome and minaret.' },
  { emoji: '🐅', q: 'Which animal is this?', o: ['Leopard', 'Tiger', 'Cheetah', 'Lion'], c: 1, e: 'A tiger — India\'s national animal.' },
  { emoji: '🍔', q: 'Which food is shown?', o: ['Hot dog', 'Burger', 'Sandwich', 'Wrap'], c: 1, e: 'A classic burger.' },
  { emoji: '🐬', q: 'Which marine animal is this?', o: ['Shark', 'Dolphin', 'Whale', 'Seal'], c: 1, e: 'A dolphin — a clever marine mammal.' },
  { emoji: '🎻', q: 'Which instrument is shown?', o: ['Cello', 'Violin', 'Viola', 'Double bass'], c: 1, e: 'A violin.' },
];

// Audio melodies — encoded as note sequences. The client synthesizes them with an
// oscillator. Each note is [noteName, durationSeconds]. Tunes are well-known/public domain.
export const audioQuestions = [
  {
    q: 'Which nursery tune is being played?',
    melody: [['C4', 0.4], ['C4', 0.4], ['G4', 0.4], ['G4', 0.4], ['A4', 0.4], ['A4', 0.4], ['G4', 0.8], ['F4', 0.4], ['F4', 0.4], ['E4', 0.4], ['E4', 0.4], ['D4', 0.4], ['D4', 0.4], ['C4', 0.8]],
    o: ['Twinkle Twinkle Little Star', 'Jingle Bells', 'Happy Birthday', 'Old MacDonald'], c: 0, e: 'That is "Twinkle Twinkle Little Star".',
  },
  {
    q: 'Identify this classic melody.',
    melody: [['E4', 0.4], ['D4', 0.4], ['C4', 0.4], ['D4', 0.4], ['E4', 0.4], ['E4', 0.4], ['E4', 0.8], ['D4', 0.4], ['D4', 0.4], ['D4', 0.8], ['E4', 0.4], ['G4', 0.4], ['G4', 0.8]],
    o: ['Row Your Boat', 'Mary Had a Little Lamb', 'London Bridge', 'Frère Jacques'], c: 1, e: 'That is "Mary Had a Little Lamb".',
  },
  {
    q: 'Which festive tune is this?',
    melody: [['E4', 0.4], ['E4', 0.4], ['E4', 0.8], ['E4', 0.4], ['E4', 0.4], ['E4', 0.8], ['E4', 0.4], ['G4', 0.4], ['C4', 0.4], ['D4', 0.4], ['E4', 1.0]],
    o: ['Silent Night', 'Jingle Bells', 'Deck the Halls', 'We Wish You'], c: 1, e: 'That is "Jingle Bells".',
  },
  {
    q: 'Identify this famous classical theme.',
    melody: [['E4', 0.4], ['E4', 0.4], ['F4', 0.4], ['G4', 0.4], ['G4', 0.4], ['F4', 0.4], ['E4', 0.4], ['D4', 0.4], ['C4', 0.4], ['C4', 0.4], ['D4', 0.4], ['E4', 0.4], ['E4', 0.6], ['D4', 0.2], ['D4', 0.8]],
    o: ['Für Elise', 'Ode to Joy', 'Moonlight Sonata', 'Canon in D'], c: 1, e: 'That is Beethoven\'s "Ode to Joy".',
  },
  {
    q: 'Which round/canon is this?',
    melody: [['C4', 0.4], ['D4', 0.4], ['E4', 0.4], ['C4', 0.4], ['C4', 0.4], ['D4', 0.4], ['E4', 0.4], ['C4', 0.4], ['E4', 0.4], ['F4', 0.4], ['G4', 0.8], ['E4', 0.4], ['F4', 0.4], ['G4', 0.8]],
    o: ['Frère Jacques', 'Three Blind Mice', 'Twinkle Twinkle', 'Hot Cross Buns'], c: 0, e: 'That is "Frère Jacques".',
  },
  {
    q: 'Which celebratory tune is being played?',
    melody: [['C4', 0.3], ['C4', 0.2], ['D4', 0.5], ['C4', 0.5], ['F4', 0.5], ['E4', 1.0], ['C4', 0.3], ['C4', 0.2], ['D4', 0.5], ['C4', 0.5], ['G4', 0.5], ['F4', 1.0]],
    o: ['Happy Birthday', 'Auld Lang Syne', 'For He\'s a Jolly Good Fellow', 'Congratulations'], c: 0, e: 'That is the "Happy Birthday" tune.',
  },
  {
    q: 'Identify this children\'s song.',
    melody: [['G4', 0.4], ['A4', 0.4], ['G4', 0.4], ['F4', 0.4], ['E4', 0.4], ['F4', 0.4], ['G4', 0.8], ['D4', 0.4], ['E4', 0.4], ['F4', 0.6], ['E4', 0.4], ['F4', 0.4], ['G4', 0.8]],
    o: ['London Bridge Is Falling Down', 'Ring a Ring o\' Roses', 'The Wheels on the Bus', 'Baa Baa Black Sheep'], c: 0, e: 'That is "London Bridge Is Falling Down".',
  },
  {
    q: 'Which famous opening riff-melody is this?',
    melody: [['E5', 0.3], ['D5', 0.3], ['E5', 0.3], ['D5', 0.3], ['E5', 0.3], ['B4', 0.3], ['D5', 0.3], ['C5', 0.3], ['A4', 0.8]],
    o: ['Für Elise', 'Moonlight Sonata', 'Clair de Lune', 'The Entertainer'], c: 0, e: 'That is the opening of Beethoven\'s "Für Elise".',
  },
  {
    q: 'Which farm-themed song is this?',
    melody: [['G4', 0.4], ['G4', 0.4], ['G4', 0.4], ['D4', 0.4], ['E4', 0.4], ['E4', 0.4], ['D4', 0.8], ['B4', 0.4], ['B4', 0.4], ['A4', 0.4], ['A4', 0.4], ['G4', 0.8]],
    o: ['Old MacDonald Had a Farm', 'BINGO', 'The Farmer in the Dell', 'This Old Man'], c: 0, e: 'That is "Old MacDonald Had a Farm".',
  },
  {
    q: 'Identify this simple tune.',
    melody: [['B4', 0.4], ['A4', 0.4], ['G4', 0.4], ['B4', 0.4], ['A4', 0.4], ['G4', 0.4], ['G4', 0.3], ['G4', 0.3], ['G4', 0.3], ['A4', 0.3], ['A4', 0.3], ['A4', 0.3], ['B4', 0.4], ['A4', 0.4], ['G4', 0.8]],
    o: ['Hot Cross Buns', 'Mary Had a Little Lamb', 'Three Blind Mice', 'Twinkle Twinkle'], c: 2, e: 'That is "Three Blind Mice".',
  },
  {
    q: 'Which gentle round is this?',
    melody: [['C4', 0.5], ['C4', 0.5], ['C4', 0.4], ['D4', 0.3], ['E4', 0.8], ['E4', 0.4], ['D4', 0.3], ['E4', 0.4], ['F4', 0.3], ['G4', 1.0]],
    o: ['Row, Row, Row Your Boat', 'Frère Jacques', 'Kumbaya', 'Brahms\' Lullaby'], c: 0, e: 'That is "Row, Row, Row Your Boat".',
  },
  {
    q: 'Identify this short scale-based tune.',
    melody: [['C4', 0.3], ['D4', 0.3], ['E4', 0.3], ['F4', 0.3], ['G4', 0.3], ['A4', 0.3], ['B4', 0.3], ['C5', 0.6], ['C5', 0.3], ['B4', 0.3], ['A4', 0.3], ['G4', 0.3], ['F4', 0.3], ['E4', 0.3], ['D4', 0.3], ['C4', 0.6]],
    o: ['A major scale (Do-Re-Mi)', 'Chopsticks', 'Heart and Soul', 'The Entertainer'], c: 0, e: 'That is a simple Do-Re-Mi major scale up and down.',
  },
];
