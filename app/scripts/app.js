import 'chromereload/devonly'

/*import { cpInit } from './content/settings.js';*/
var dom = require('./content/dom.js');
/*
import { cpInit } from './settings/settings.js';
cpInit();*/

import { test } from './settings/test.js';
import { optionValues } from "./utils/default"

optionValues();
test();