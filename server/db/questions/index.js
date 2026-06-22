// Aggregates every topic's question array, keyed by the topic id used in shared/constants.js
import music from './music.js';
import movies from './movies.js';
import history from './history.js';
import science from './science.js';
import geography from './geography.js';
import sports from './sports.js';
import food from './food.js';
import technology from './technology.js';
import popculture from './popculture.js';
import ott from './ott.js';
import art from './art.js';
import nature from './nature.js';
import mythology from './mythology.js';
import math from './math.js';
import language from './language.js';

export const QUESTIONS_BY_TOPIC = {
  music,
  movies,
  history,
  science,
  geography,
  sports,
  food,
  technology,
  popculture,
  ott,
  art,
  nature,
  mythology,
  math,
  language,
};

export default QUESTIONS_BY_TOPIC;
