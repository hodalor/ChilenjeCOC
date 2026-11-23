import { bembaHymns } from './bemba-hymns';
import { chewaHymns } from './chewa-hymns';
import { tongaHymns } from './tonga-hymns';
import { tumbukaHymns } from './tumbuka-hymns';
import { zuluHymns } from './zulu-hymns';
import { englishHymns} from './english-hymns';

export const data = [
  // Bemba him starts from here 
{
  language: "Bemba",
  hyms: bembaHymns
},
  // Bemba hymn ends here
  
  // Chewa hymn starts here 
  {
    language: "Chechewa",
    hyms: chewaHymns
      
  },
   // Chewa hymn ends here 
  // TONGA hymn start here 
  {
    language: "Tonga",
    hyms:tongaHymns
  },
  // Tonga hymn ends here 
  // Tumbuka hymn starts here 
  {
    language: "Tumbuka",
    hyms: tumbukaHymns
  },
      
    // Tumbuka hymn ends here 
  // Zulu hymn starts here 
  {
    language: "Zulu",
    hyms: zuluHymns
  },
  // Zulu hymn ends here 
  // Shona hymn starts here 
  {
    language: "Shona",
    hyms: [
      {
        title: 'Mtuŵa, Mtuŵa, Mtuŵa',
        hymnNo: 1,
        creator: 'John B. Dykes (1923-76)',
        chorus: null,
        stanzers: [
          {
            stanzer: 1,
            lines: [
              'Mtuŵa, Mtuŵa, Mtuŵa, Chiuta mwa mphavu',
              'Na macherochero tikumwimbirani',
              'Mtuwa Mtuŵa, Mtuŵa',
              'Mwa’tatu njumo, mutumbikike!',
            ],
          },
          {
            stanzer: 2,
            lines: [
              'Mtuŵa, Mtuŵa, Mtuŵa',
              'Ŵatuŵa kuchanya',
              'Ŵose ŵakumrumbani',
              'Nakusopa kwawo;',
              'Zinkharamba nazo ',
              'Zimkumlambirani, mulipo',
              ' M’kaŵa, m’timuŵengeswi.',
            ],
          },
          {
            stanzer: 3,
            lines: [
              'Mtuŵa, Mtuŵa, Mtuŵa, chisi',
              'Cham’bisani;',
              'Ŵanthu ntha ŵakuwona uchindami winu;',
              'Ndimwe Mtuŵa pera mwa ŵakufikapo',
              'Mu mphavu, m’kutemwa, na m’uweme',
            ],
          },
          {
            stanzer: 4,
            lines: [
              'Mtuŵa, Mtuŵa, Mtuŵa, mwa nkhongono zose',
              'Vilengiwa vyose vikumrumbani ‘mwe.',
              'Mtuŵa, Mtuŵa, Mtuŵa, mwa wezi na mphavu,',
              'Mwa’tatu njumo, mutumbikike!',
            ],
          },
        ]
      },
    ]
  },
    // Shona hymn ends here 
  // English hymn starts here 
  {
    language: "English",
    hyms: englishHymns
  },
  // English hymn Ends here 
]
