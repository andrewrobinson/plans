// Configurations for the Configuration list at the bottom right (living_room.js):
// named snapshots of every setting in every room, the same on every device,
// unlike those kept with the list's Save. Edit freely, then reload the page.
//
// A configuration is everything the page shows bar where you're looking from
// (room_dimensions.md has the format): the furniture in every room and where
// it is, the cupboards' designs, sizes, colours, the doors and the things to
// store. To add one: set the page up as you want it, run
// `copy(JSON.stringify(plans.export(), null, 2))` in the browser's console,
// and paste it in below, as
//
//   id: { label: 'What it shows', title: 'A longer note', configuration: { "version": 1, ... } },
//
// with an id of your own (letters and digits, no spaces). Give it every
// setting, as export() does, so it doesn't change when a default does.
window.ROOM_CONFIGURATIONS = {
  list: {
    // The rooms as they were on 18 Oct 2026, from the user's photos and
    // measurements: the page's defaults that day
    oct18: { label: '18 October 2026', title: 'The rooms as they are on 18 October 2026: the lounge with no cupboard yet, the tables in the corner by the door',
      configuration: {
        "version": 1,
        "doors": {
          "room": 90,
          "tall": 0,
          "second": 0,
          "bedroom": 90,
          "flat": 0,
          "outside": 0,
          "bedroomCupboardTall": 0,
          "bedroomCupboardSecond": 0,
          "desk": "foldedAway",
          "bedroomCupboardDesk": "foldedAway",
          "garage": "hidden"
        },
        "colours": {
          "floor": 0,
          "cupboard": 4,
          "wall": 0,
          "woodwork": 0,
          "dresser": 0,
          "carpet": 0,
          "bedroomCupboard": 0,
          "shelves": 0
        },
        "livingRoom": {
          "frontWall": "none"
        },
        "pieces": {
          "cornerCupboard": {
            "design": {
              "option": 16,
              "T": 600,
              "R": 330,
              "F": 1200,
              "BOARD": 18,
              "TOP": 0,
              "LEG": 600,
              "LEG_D": 600,
              "L_SHELVES": {
                "back": [
                  600,
                  1200,
                  1800
                ],
                "left": [
                  600,
                  1200,
                  1800
                ]
              },
              "DIAG_RUN": 700,
              "DIAG_BACK": 0,
              "DIAG_LEFT": 0,
              "WARD": 900,
              "WARD_D": 600,
              "TOWER": 400,
              "CORNER_W": 800,
              "CORNER_D": 650,
              "SIDE_SHELF": false,
              "SIDE_W": 400,
              "SIDE_D": 330,
              "DESK": false,
              "DESK_W": 780,
              "DESK_D": 500,
              "DESK_H": 740
            }
          },
          "bedroomCupboard": {
            "design": {
              "option": 10,
              "T": 600,
              "R": 330,
              "F": 1200,
              "BOARD": 18,
              "TOP": 0,
              "LEG": 600,
              "LEG_D": 600,
              "L_SHELVES": {
                "back": [
                  600,
                  1200,
                  1800
                ],
                "left": [
                  600,
                  1200,
                  1800
                ]
              },
              "DIAG_RUN": 700,
              "DIAG_BACK": 0,
              "DIAG_LEFT": 0,
              "WARD": 900,
              "WARD_D": 600,
              "TOWER": 400,
              "CORNER_W": 800,
              "CORNER_D": 650,
              "SIDE_SHELF": false,
              "SIDE_W": 400,
              "SIDE_D": 330,
              "DESK": false,
              "DESK_W": 780,
              "DESK_D": 500,
              "DESK_H": 740
            },
            "in": {
              "bedroom": {
                "on": false
              }
            }
          },
          "bench": {
            "design": {
              "height": 780
            },
            "in": {
              "livingRoom": {
                "on": false
              }
            }
          },
          "aboveBench": {
            "design": {
              "what": "tvAndShelves",
              "shelfDepth": 250,
              "tv": 75
            }
          },
          "dresser": {
            "design": {
              "w": 1000,
              "h": 1930,
              "baseD": 420,
              "baseH": 830,
              "upperD": 420
            }
          },
          "larder": {
            "design": {
              "model": "chester",
              "w": 1100,
              "h": 1950,
              "d": 510
            }
          },
          "island": {
            "in": {
              "livingRoom": {
                "at": "room",
                "x": 1395,
                "y": 3571,
                "turn": 0
              }
            }
          },
          "sofa": {
            "design": {
              "model": "drift",
              "w": 1480,
              "d": 790,
              "h": 670,
              "asBed": false
            },
            "in": {
              "livingRoom": {
                "front": 1900,
                "move": {
                  "x": 1875,
                  "y": 975,
                  "turn": 180
                }
              }
            }
          },
          "bed": {
            "in": {
              "bedroom": {
                "u": 1360,
                "v": 0,
                "turn": 0
              }
            }
          },
          "bookcase": {
            "design": {
              "w": 1490,
              "d": 290,
              "h": 1220
            },
            "in": {
              "bedroom": {
                "on": true,
                "u": 2569,
                "v": 2841,
                "turn": 180
              },
              "livingRoom": {
                "on": false,
                "move": null
              }
            }
          },
          "pineCupboard": {
            "design": {
              "w": 1300,
              "d": 500,
              "h": 1790
            },
            "in": {
              "bedroom": {
                "on": true,
                "u": 3682,
                "v": 1901,
                "turn": 90
              },
              "livingRoom": {
                "on": false,
                "move": null
              },
              "garage": {
                "on": false,
                "x": 1425,
                "y": 0,
                "turn": 0
              }
            }
          },
          "billy": {
            "in": {
              "bedroom": {
                "on": false,
                "wall": "breast",
                "along": 2569,
                "lying": false
              },
              "livingRoom": {
                "on": true,
                "lying": true,
                "move": {
                  "x": 1875,
                  "y": 0,
                  "turn": 0
                }
              },
              "garage": {
                "on": false,
                "lying": false,
                "x": 0,
                "y": 1920,
                "turn": 270
              }
            }
          },
          "billyChest": {
            "in": {
              "bedroom": {
                "on": false,
                "wall": "breast",
                "along": 2569
              },
              "livingRoom": {
                "on": true,
                "move": {
                  "x": 3748,
                  "y": 405,
                  "turn": 90
                }
              },
              "garage": {
                "on": false,
                "x": 0,
                "y": 1100,
                "turn": 270
              }
            }
          },
          "ivar": {
            "in": {
              "bedroom": {
                "on": false,
                "wall": "breast",
                "along": 2569
              },
              "livingRoom": {
                "on": true,
                "lying": true,
                "move": null
              },
              "garage": {
                "on": false,
                "x": 0,
                "y": 1100,
                "turn": 270
              }
            }
          },
          "bedsideTable": {
            "in": {
              "bedroom": {
                "on": true,
                "wall": "hallway",
                "along": 2275
              }
            }
          },
          "bedsideTableByCupboard": {
            "in": {
              "bedroom": {
                "on": true,
                "wall": "kitchen",
                "along": 1016
              }
            }
          },
          "kvistbro": {
            "in": {
              "bedroom": {
                "on": true,
                "wall": "hallway",
                "along": 400
              }
            }
          },
          "laundryBasket": {
            "in": {
              "bedroom": {
                "on": true,
                "u": 400,
                "v": 460,
                "turn": 0
              }
            }
          },
          "recessCupboards": {
            "design": {
              "lowerD": 301,
              "upperDrawers": false,
              "upperMirrors": false
            }
          },
          "mirror": {
            "design": {
              "w": 1000,
              "h": 800
            },
            "in": {
              "bedroom": {
                "on": false,
                "wall": "breast",
                "along": 2569,
                "bottom": 1400
              }
            }
          },
          "chesham": {
            "in": {
              "livingRoom": {
                "on": true,
                "onItsEnd": true,
                "move": null
              }
            }
          },
          "castorDesk": {
            "in": {
              "livingRoom": {
                "on": false,
                "at": "byTheDoor",
                "move": null
              }
            }
          },
          "cornwall": {
            "in": {
              "livingRoom": {
                "on": true,
                "legsOff": true,
                "move": null
              }
            }
          },
          "wickerBench": {
            "design": {
              "w": 920,
              "d": 410,
              "h": 450,
              "legs": 80
            },
            "in": {
              "hallway": {
                "on": true,
                "along": 1470,
                "across": 1372,
                "turn": 0
              },
              "bedroom": {
                "on": false,
                "u": 1360,
                "v": 1985,
                "turn": 0
              },
              "livingRoom": {
                "on": false,
                "x": 3686,
                "y": 2910,
                "turn": 90
              }
            }
          },
          "shoeRack": {
            "in": {
              "hallway": {
                "on": false
              }
            },
            "design": {
              "w": 460,
              "d": 300,
              "h": 1290,
              "bevel": true,
              "slope": 45,
              "shoes": true,
              "bevelDoor": 72
            }
          },
          "sean": {
            "in": {
              "garage": {
                "on": true,
                "x": 1255,
                "y": 2865,
                "turn": 180
              }
            }
          },
          "metal": {
            "in": {
              "garage": {
                "on": true,
                "x": 670,
                "y": 360,
                "turn": 90
              }
            }
          },
          "yellow": {
            "in": {
              "garage": {
                "on": true,
                "x": 3390,
                "y": 2550,
                "turn": 0,
                "z": 438
              }
            }
          },
          "scaffoldBench": {
            "in": {
              "garage": {
                "on": true,
                "x": 3430,
                "y": 2650,
                "turn": 0
              }
            }
          },
          "smallBilly": {
            "in": {
              "garage": {
                "on": true,
                "x": 2480,
                "y": 0,
                "turn": 0,
                "off": 0
              }
            }
          },
          "potters": {
            "in": {
              "garage": {
                "on": true,
                "x": 3090,
                "y": 0,
                "turn": 0,
                "off": 0
              }
            }
          },
          "biltong": {
            "in": {
              "garage": {
                "on": true,
                "x": 580,
                "y": 1490,
                "turn": 90,
                "z": 750
              }
            }
          },
          "trellis": {
            "in": {
              "garage": {
                "on": true,
                "x": 735,
                "y": 1475,
                "turn": 90
              }
            }
          }
        },
        "hallway": {
          "wcWall": {
            "shelves": {
              "on": false,
              "count": 2,
              "height": 1350,
              "width": 1200,
              "along": 810,
              "spacing": 440,
              "depth": 220
            },
            "picture": {
              "on": false,
              "height": 1420,
              "width": 670,
              "tall": 930,
              "along": 830
            }
          },
          "loungeWall": {
            "shelves": {
              "on": false,
              "count": 2,
              "height": 1290,
              "width": 1200,
              "along": 600,
              "spacing": 300,
              "depth": 200
            },
            "picture": {
              "on": false,
              "height": 1220,
              "width": 680,
              "tall": 1000,
              "along": 660
            }
          },
          "tvWall": {
            "shelves": {
              "on": false,
              "count": 3,
              "height": 1000,
              "width": 1200,
              "along": 1180,
              "spacing": 440,
              "depth": 240
            },
            "picture": {
              "on": false,
              "height": 1430,
              "width": 1200,
              "tall": 1000,
              "along": 1160
            }
          },
          "cornerShelves": {
            "on": false,
            "count": 3,
            "height": 1000,
            "tvLength": 1200,
            "wcLength": 1200,
            "spacing": 440,
            "depth": 240
          },
          "shoeBoxes": {
            "left": {
              "on": false,
              "from": 0,
              "length": 1200,
              "width": 240,
              "height": 300
            },
            "right": {
              "on": false,
              "from": 0,
              "length": 1200,
              "width": 120,
              "height": 300,
              "levelWithLeft": false
            }
          },
          "bathroomShown": true
        },
        "thingsToStore": {
          "shown": true,
          "packing": 0,
          "where": "byHand",
          "spots": [
            {
              "x": 330,
              "y": 380,
              "turned": true,
              "z": 150
            },
            {
              "x": 100,
              "y": 700,
              "turned": true,
              "z": 150
            },
            {
              "x": 0,
              "y": 650,
              "turned": true,
              "z": 150
            },
            {
              "x": 450,
              "y": 450,
              "turned": true,
              "z": 150
            },
            {
              "x": 440,
              "y": 880,
              "turned": false,
              "z": 150
            },
            {
              "x": 820,
              "y": 1380,
              "turned": false,
              "z": 0
            },
            {
              "x": 30,
              "y": 30,
              "turned": false,
              "z": 150
            }
          ]
        }
      },
    },
    // Option 12 (20 Oct 2026): the lounge laid out like the user's photo, with
    // room for the things to store. Option 10's corner cupboard, 900 × 1150
    // (about 860 × 1120 is the least that holds all 7 things in the first
    // packing; a little more chosen), with the lit open bookshelf beside it,
    // the bench to the window wall, and the TV with one shelf over it. The
    // things packed in the cupboard; Billy, BillyChest, the Ivar and the
    // kitchen tables (in the corner the cupboard takes) out of the lounge; the
    // Drift facing the TV. The cupboard and the bookshelf stand
    // 2050 high, level with the top of the doorway's frame beside them (asked
    // for). The fold-down desk on its side, open (asked for). No window seat:
    // the first window's radiator is where it would go
    option12: { label: 'Option 12', title: 'The lounge like the photo: a 900 × 1150 corner cupboard, as high as the doorway, holding the things to store, a fold-down desk on its side, lit shelves beside it, the bench, the TV and one shelf',
      configuration: {
        "version": 1,
        "doors": {
          "room": 90,
          "tall": 0,
          "second": 0,
          "bedroom": 90,
          "flat": 0,
          "outside": 0,
          "bedroomCupboardTall": 0,
          "bedroomCupboardSecond": 0,
          "desk": "down",
          "bedroomCupboardDesk": "foldedAway",
          "garage": "hidden"
        },
        "colours": {
          "floor": 0,
          "cupboard": 4,
          "wall": 0,
          "woodwork": 0,
          "dresser": 0,
          "carpet": 0,
          "bedroomCupboard": 0,
          "shelves": 0
        },
        "livingRoom": {
          "frontWall": "none"
        },
        "pieces": {
          "cornerCupboard": {
            "design": {
              "option": 10,
              "T": 600,
              "R": 330,
              "F": 1200,
              "BOARD": 18,
              "TOP": 2050,
              "LEG": 600,
              "LEG_D": 600,
              "L_SHELVES": {
                "back": [
                  600,
                  1200,
                  1800
                ],
                "left": [
                  600,
                  1200,
                  1800
                ]
              },
              "DIAG_RUN": 700,
              "DIAG_BACK": 0,
              "DIAG_LEFT": 0,
              "WARD": 900,
              "WARD_D": 600,
              "TOWER": 400,
              "CORNER_W": 900,
              "CORNER_D": 1150,
              "SIDE_SHELF": true,
              "SIDE_W": 400,
              "SIDE_D": 330,
              "DESK": true,
              "DESK_W": 780,
              "DESK_D": 500,
              "DESK_H": 740
            }
          },
          "bedroomCupboard": {
            "design": {
              "option": 10,
              "T": 600,
              "R": 330,
              "F": 1200,
              "BOARD": 18,
              "TOP": 0,
              "LEG": 600,
              "LEG_D": 600,
              "L_SHELVES": {
                "back": [
                  600,
                  1200,
                  1800
                ],
                "left": [
                  600,
                  1200,
                  1800
                ]
              },
              "DIAG_RUN": 700,
              "DIAG_BACK": 0,
              "DIAG_LEFT": 0,
              "WARD": 900,
              "WARD_D": 600,
              "TOWER": 400,
              "CORNER_W": 800,
              "CORNER_D": 650,
              "SIDE_SHELF": false,
              "SIDE_W": 400,
              "SIDE_D": 330,
              "DESK": false,
              "DESK_W": 780,
              "DESK_D": 500,
              "DESK_H": 740
            },
            "in": {
              "bedroom": {
                "on": false
              }
            }
          },
          "bench": {
            "design": {
              "height": 780
            },
            "in": {
              "livingRoom": {
                "on": true
              }
            }
          },
          "aboveBench": {
            "design": {
              "what": "tvAndTopShelf",
              "shelfDepth": 250,
              "tv": 75
            }
          },
          "dresser": {
            "design": {
              "w": 1000,
              "h": 1930,
              "baseD": 420,
              "baseH": 830,
              "upperD": 420
            }
          },
          "larder": {
            "design": {
              "model": "chester",
              "w": 1100,
              "h": 1950,
              "d": 510
            }
          },
          "island": {
            "in": {
              "livingRoom": {
                "at": "room",
                "x": 1395,
                "y": 3571,
                "turn": 0
              }
            }
          },
          "sofa": {
            "design": {
              "model": "drift",
              "w": 1480,
              "d": 790,
              "h": 670,
              "asBed": false
            },
            "in": {
              "livingRoom": {
                "front": 1900,
                "move": null
              }
            }
          },
          "bed": {
            "in": {
              "bedroom": {
                "u": 1360,
                "v": 0,
                "turn": 0
              }
            }
          },
          "bookcase": {
            "design": {
              "w": 1490,
              "d": 290,
              "h": 1220
            },
            "in": {
              "bedroom": {
                "on": true,
                "u": 2569,
                "v": 2841,
                "turn": 180
              },
              "livingRoom": {
                "on": false,
                "move": null
              }
            }
          },
          "pineCupboard": {
            "design": {
              "w": 1300,
              "d": 500,
              "h": 1790
            },
            "in": {
              "bedroom": {
                "on": true,
                "u": 3682,
                "v": 1901,
                "turn": 90
              },
              "livingRoom": {
                "on": false,
                "move": null
              },
              "garage": {
                "on": false,
                "x": 1425,
                "y": 0,
                "turn": 0
              }
            }
          },
          "billy": {
            "in": {
              "bedroom": {
                "on": false,
                "wall": "breast",
                "along": 2569,
                "lying": false
              },
              "livingRoom": {
                "on": false,
                "lying": true,
                "move": {
                  "x": 1875,
                  "y": 0,
                  "turn": 0
                }
              },
              "garage": {
                "on": false,
                "lying": false,
                "x": 0,
                "y": 1920,
                "turn": 270
              }
            }
          },
          "billyChest": {
            "in": {
              "bedroom": {
                "on": false,
                "wall": "breast",
                "along": 2569
              },
              "livingRoom": {
                "on": false,
                "move": {
                  "x": 3748,
                  "y": 405,
                  "turn": 90
                }
              },
              "garage": {
                "on": false,
                "x": 0,
                "y": 1100,
                "turn": 270
              }
            }
          },
          "ivar": {
            "in": {
              "bedroom": {
                "on": false,
                "wall": "breast",
                "along": 2569
              },
              "livingRoom": {
                "on": false,
                "lying": true,
                "move": null
              },
              "garage": {
                "on": false,
                "x": 0,
                "y": 1100,
                "turn": 270
              }
            }
          },
          "bedsideTable": {
            "in": {
              "bedroom": {
                "on": true,
                "wall": "hallway",
                "along": 2275
              }
            }
          },
          "bedsideTableByCupboard": {
            "in": {
              "bedroom": {
                "on": true,
                "wall": "kitchen",
                "along": 1016
              }
            }
          },
          "kvistbro": {
            "in": {
              "bedroom": {
                "on": true,
                "wall": "hallway",
                "along": 400
              }
            }
          },
          "laundryBasket": {
            "in": {
              "bedroom": {
                "on": true,
                "u": 400,
                "v": 460,
                "turn": 0
              }
            }
          },
          "recessCupboards": {
            "design": {
              "lowerD": 301,
              "upperDrawers": false,
              "upperMirrors": false
            }
          },
          "mirror": {
            "design": {
              "w": 1000,
              "h": 800
            },
            "in": {
              "bedroom": {
                "on": false,
                "wall": "breast",
                "along": 2569,
                "bottom": 1400
              }
            }
          },
          "chesham": {
            "in": {
              "livingRoom": {
                "on": false,
                "onItsEnd": true,
                "move": null
              }
            }
          },
          "castorDesk": {
            "in": {
              "livingRoom": {
                "on": false,
                "at": "byTheDoor",
                "move": null
              }
            }
          },
          "cornwall": {
            "in": {
              "livingRoom": {
                "on": false,
                "legsOff": true,
                "move": null
              }
            }
          },
          "wickerBench": {
            "design": {
              "w": 920,
              "d": 410,
              "h": 450,
              "legs": 80
            },
            "in": {
              "hallway": {
                "on": true,
                "along": 1470,
                "across": 1372,
                "turn": 0
              },
              "bedroom": {
                "on": false,
                "u": 1360,
                "v": 1985,
                "turn": 0
              },
              "livingRoom": {
                "on": false,
                "x": 3686,
                "y": 2910,
                "turn": 90
              }
            }
          },
          "shoeRack": {
            "in": {
              "hallway": {
                "on": false
              }
            },
            "design": {
              "w": 460,
              "d": 300,
              "h": 1290,
              "bevel": true,
              "slope": 45,
              "shoes": true,
              "bevelDoor": 72
            }
          },
          "sean": {
            "in": {
              "garage": {
                "on": true,
                "x": 1255,
                "y": 2865,
                "turn": 180
              }
            }
          },
          "metal": {
            "in": {
              "garage": {
                "on": true,
                "x": 670,
                "y": 360,
                "turn": 90
              }
            }
          },
          "yellow": {
            "in": {
              "garage": {
                "on": true,
                "x": 3390,
                "y": 2550,
                "turn": 0,
                "z": 438
              }
            }
          },
          "scaffoldBench": {
            "in": {
              "garage": {
                "on": true,
                "x": 3430,
                "y": 2650,
                "turn": 0
              }
            }
          },
          "smallBilly": {
            "in": {
              "garage": {
                "on": true,
                "x": 2480,
                "y": 0,
                "turn": 0,
                "off": 0
              }
            }
          },
          "potters": {
            "in": {
              "garage": {
                "on": true,
                "x": 3090,
                "y": 0,
                "turn": 0,
                "off": 0
              }
            }
          },
          "biltong": {
            "in": {
              "garage": {
                "on": true,
                "x": 580,
                "y": 1490,
                "turn": 90,
                "z": 750
              }
            }
          },
          "trellis": {
            "in": {
              "garage": {
                "on": true,
                "x": 735,
                "y": 1475,
                "turn": 90
              }
            }
          }
        },
        "hallway": {
          "wcWall": {
            "shelves": {
              "on": false,
              "count": 2,
              "height": 1350,
              "width": 1200,
              "along": 810,
              "spacing": 440,
              "depth": 220
            },
            "picture": {
              "on": false,
              "height": 1420,
              "width": 670,
              "tall": 930,
              "along": 830
            }
          },
          "loungeWall": {
            "shelves": {
              "on": false,
              "count": 2,
              "height": 1290,
              "width": 1200,
              "along": 600,
              "spacing": 300,
              "depth": 200
            },
            "picture": {
              "on": false,
              "height": 1220,
              "width": 680,
              "tall": 1000,
              "along": 660
            }
          },
          "tvWall": {
            "shelves": {
              "on": false,
              "count": 3,
              "height": 1000,
              "width": 1200,
              "along": 1180,
              "spacing": 440,
              "depth": 240
            },
            "picture": {
              "on": false,
              "height": 1430,
              "width": 1200,
              "tall": 1000,
              "along": 1160
            }
          },
          "cornerShelves": {
            "on": false,
            "count": 3,
            "height": 1000,
            "tvLength": 1200,
            "wcLength": 1200,
            "spacing": 440,
            "depth": 240
          },
          "shoeBoxes": {
            "left": {
              "on": false,
              "from": 0,
              "length": 1200,
              "width": 240,
              "height": 300
            },
            "right": {
              "on": false,
              "from": 0,
              "length": 1200,
              "width": 120,
              "height": 300,
              "levelWithLeft": false
            }
          },
          "bathroomShown": true
        },
        "thingsToStore": {
          "shown": true,
          "packing": 0,
          "where": "cupboard",
          "spots": [
            {
              "x": 568,
              "y": 298,
              "turned": true,
              "z": 0
            },
            {
              "x": 118,
              "y": 18,
              "turned": false,
              "z": 0
            },
            {
              "x": 18,
              "y": 18,
              "turned": true,
              "z": 0
            },
            {
              "x": 118,
              "y": 238,
              "turned": false,
              "z": 0
            },
            {
              "x": 518,
              "y": 18,
              "turned": false,
              "z": 0
            },
            {
              "x": 18,
              "y": 558,
              "turned": false,
              "z": 0
            },
            {
              "x": 718,
              "y": 298,
              "turned": true,
              "z": 0
            }
          ]
        }
      },
    },
    // Pretty (20 Oct 2026), the user's: Option 12 as they set it from its
    // link, the corner cupboard cut back to 327 out along the left wall
    // (level with the side bookshelf) and 1880 high (inside it's 864 × 291,
    // too shallow for the things to store) and the kitchen tables hidden; its fold-down desk off, as the bookshelf covers the
    // cupboard's side, and the desk on castors parked by the door in its
    // place. The bedroom from their second link: the new cupboard on, as
    // option 8 with its diagonal (T 396, R 400, F 2192, DIAG_RUN 1450, its
    // straight fronts 1090 and 1440), the bookcase, the pine cupboard and the
    // bedside table by it out, and the recess cupboards 448 deep. The things
    // to store placed by hand from their third link: in the bedroom's new
    // cupboard, bar the yellow tub, left in the lounge by the corner cupboard
    pretty: { label: 'Pretty', title: 'Option 12 with a 327-deep, 1880-high corner cupboard and the desk on castors parked by the door; the bedroom with the new cupboard as option 8, holding the things to store',
      configuration: {
        "version": 1,
        "doors": {
          "room": 90,
          "tall": 0,
          "second": 0,
          "bedroom": 90,
          "flat": 0,
          "outside": 0,
          "bedroomCupboardTall": 0,
          "bedroomCupboardSecond": 0,
          "desk": "foldedAway",
          "bedroomCupboardDesk": "foldedAway",
          "garage": "hidden"
        },
        "colours": {
          "floor": 0,
          "cupboard": 4,
          "wall": 0,
          "woodwork": 0,
          "dresser": 0,
          "carpet": 0,
          "bedroomCupboard": 0,
          "shelves": 0
        },
        "livingRoom": {
          "frontWall": "none"
        },
        "pieces": {
          "cornerCupboard": {
            "design": {
              "option": 10,
              "T": 600,
              "R": 330,
              "F": 1200,
              "BOARD": 18,
              "TOP": 1880,
              "LEG": 600,
              "LEG_D": 600,
              "L_SHELVES": {
                "back": [
                  600,
                  1200,
                  1800
                ],
                "left": [
                  600,
                  1200,
                  1800
                ]
              },
              "DIAG_RUN": 700,
              "DIAG_BACK": 0,
              "DIAG_LEFT": 0,
              "WARD": 900,
              "WARD_D": 600,
              "TOWER": 400,
              "CORNER_W": 900,
              "CORNER_D": 327,
              "SIDE_SHELF": true,
              "SIDE_W": 400,
              "SIDE_D": 330,
              "DESK": false,
              "DESK_W": 780,
              "DESK_D": 500,
              "DESK_H": 740
            }
          },
          "bedroomCupboard": {
            "design": {
              "option": 8,
              "T": 396,
              "R": 400,
              "F": 2192,
              "BOARD": 18,
              "TOP": 0,
              "LEG": 1422,
              "LEG_D": 330,
              "L_SHELVES": {
                "back": [
                  600,
                  1200,
                  1800
                ],
                "left": [
                  600,
                  1200,
                  1800
                ]
              },
              "DIAG_RUN": 1450,
              "DIAG_BACK": 1090,
              "DIAG_LEFT": 1440,
              "WARD": 900,
              "WARD_D": 600,
              "TOWER": 400,
              "CORNER_W": 800,
              "CORNER_D": 650,
              "SIDE_SHELF": false,
              "SIDE_W": 400,
              "SIDE_D": 330,
              "DESK": false,
              "DESK_W": 780,
              "DESK_D": 500,
              "DESK_H": 740
            },
            "in": {
              "bedroom": {
                "on": true
              }
            }
          },
          "bench": {
            "design": {
              "height": 780
            },
            "in": {
              "livingRoom": {
                "on": true
              }
            }
          },
          "aboveBench": {
            "design": {
              "what": "tvAndTopShelf",
              "shelfDepth": 250,
              "tv": 75
            }
          },
          "dresser": {
            "design": {
              "w": 1000,
              "h": 1930,
              "baseD": 420,
              "baseH": 830,
              "upperD": 420
            }
          },
          "larder": {
            "design": {
              "model": "chester",
              "w": 1100,
              "h": 1950,
              "d": 510
            }
          },
          "island": {
            "in": {
              "livingRoom": {
                "at": "room",
                "x": 1395,
                "y": 3571,
                "turn": 0
              }
            }
          },
          "sofa": {
            "design": {
              "model": "drift",
              "w": 1480,
              "d": 790,
              "h": 670,
              "asBed": false
            },
            "in": {
              "livingRoom": {
                "front": 1900,
                "move": null
              }
            }
          },
          "bed": {
            "in": {
              "bedroom": {
                "u": 1360,
                "v": 0,
                "turn": 0
              }
            }
          },
          "bookcase": {
            "design": {
              "w": 1490,
              "d": 290,
              "h": 1220
            },
            "in": {
              "bedroom": {
                "on": false,
                "u": 2569,
                "v": 2841,
                "turn": 180
              },
              "livingRoom": {
                "on": false,
                "move": null
              }
            }
          },
          "pineCupboard": {
            "design": {
              "w": 1300,
              "d": 500,
              "h": 1790
            },
            "in": {
              "bedroom": {
                "on": false,
                "u": 3682,
                "v": 1901,
                "turn": 90
              },
              "livingRoom": {
                "on": false,
                "move": null
              },
              "garage": {
                "on": false,
                "x": 1425,
                "y": 0,
                "turn": 0
              }
            }
          },
          "billy": {
            "in": {
              "bedroom": {
                "on": false,
                "wall": "breast",
                "along": 2569,
                "lying": false
              },
              "livingRoom": {
                "on": false,
                "lying": true,
                "move": {
                  "x": 1875,
                  "y": 0,
                  "turn": 0
                }
              },
              "garage": {
                "on": false,
                "lying": false,
                "x": 0,
                "y": 1920,
                "turn": 270
              }
            }
          },
          "billyChest": {
            "in": {
              "bedroom": {
                "on": false,
                "wall": "breast",
                "along": 2569
              },
              "livingRoom": {
                "on": false,
                "move": {
                  "x": 3748,
                  "y": 405,
                  "turn": 90
                }
              },
              "garage": {
                "on": false,
                "x": 0,
                "y": 1100,
                "turn": 270
              }
            }
          },
          "ivar": {
            "in": {
              "bedroom": {
                "on": false,
                "wall": "breast",
                "along": 2569
              },
              "livingRoom": {
                "on": false,
                "lying": true,
                "move": null
              },
              "garage": {
                "on": false,
                "x": 0,
                "y": 1100,
                "turn": 270
              }
            }
          },
          "bedsideTable": {
            "in": {
              "bedroom": {
                "on": true,
                "wall": "hallway",
                "along": 2275
              }
            }
          },
          "bedsideTableByCupboard": {
            "in": {
              "bedroom": {
                "on": false,
                "wall": "kitchen",
                "along": 1016
              }
            }
          },
          "kvistbro": {
            "in": {
              "bedroom": {
                "on": true,
                "wall": "hallway",
                "along": 400
              }
            }
          },
          "laundryBasket": {
            "in": {
              "bedroom": {
                "on": true,
                "u": 400,
                "v": 460,
                "turn": 0
              }
            }
          },
          "recessCupboards": {
            "design": {
              "lowerD": 448,
              "upperDrawers": false,
              "upperMirrors": false
            }
          },
          "mirror": {
            "design": {
              "w": 1000,
              "h": 800
            },
            "in": {
              "bedroom": {
                "on": false,
                "wall": "breast",
                "along": 2569,
                "bottom": 1400
              }
            }
          },
          "chesham": {
            "in": {
              "livingRoom": {
                "on": false,
                "onItsEnd": true,
                "move": null
              }
            }
          },
          "castorDesk": {
            "in": {
              "livingRoom": {
                "on": true,
                "at": "byTheDoor",
                "move": null
              }
            }
          },
          "cornwall": {
            "in": {
              "livingRoom": {
                "on": false,
                "legsOff": true,
                "move": null
              }
            }
          },
          "wickerBench": {
            "design": {
              "w": 920,
              "d": 410,
              "h": 450,
              "legs": 80
            },
            "in": {
              "hallway": {
                "on": true,
                "along": 1470,
                "across": 1372,
                "turn": 0
              },
              "bedroom": {
                "on": false,
                "u": 1360,
                "v": 1985,
                "turn": 0
              },
              "livingRoom": {
                "on": false,
                "x": 3686,
                "y": 2910,
                "turn": 90
              }
            }
          },
          "shoeRack": {
            "in": {
              "hallway": {
                "on": false
              }
            },
            "design": {
              "w": 460,
              "d": 300,
              "h": 1290,
              "bevel": true,
              "slope": 45,
              "shoes": true,
              "bevelDoor": 72
            }
          },
          "sean": {
            "in": {
              "garage": {
                "on": true,
                "x": 1255,
                "y": 2865,
                "turn": 180
              }
            }
          },
          "metal": {
            "in": {
              "garage": {
                "on": true,
                "x": 670,
                "y": 360,
                "turn": 90
              }
            }
          },
          "yellow": {
            "in": {
              "garage": {
                "on": true,
                "x": 3390,
                "y": 2550,
                "turn": 0,
                "z": 438
              }
            }
          },
          "scaffoldBench": {
            "in": {
              "garage": {
                "on": true,
                "x": 3430,
                "y": 2650,
                "turn": 0
              }
            }
          },
          "smallBilly": {
            "in": {
              "garage": {
                "on": true,
                "x": 2480,
                "y": 0,
                "turn": 0,
                "off": 0
              }
            }
          },
          "potters": {
            "in": {
              "garage": {
                "on": true,
                "x": 3090,
                "y": 0,
                "turn": 0,
                "off": 0
              }
            }
          },
          "biltong": {
            "in": {
              "garage": {
                "on": true,
                "x": 580,
                "y": 1490,
                "turn": 90,
                "z": 750
              }
            }
          },
          "trellis": {
            "in": {
              "garage": {
                "on": true,
                "x": 735,
                "y": 1475,
                "turn": 90
              }
            }
          }
        },
        "hallway": {
          "wcWall": {
            "shelves": {
              "on": false,
              "count": 2,
              "height": 1350,
              "width": 1200,
              "along": 810,
              "spacing": 440,
              "depth": 220
            },
            "picture": {
              "on": false,
              "height": 1420,
              "width": 670,
              "tall": 930,
              "along": 830
            }
          },
          "loungeWall": {
            "shelves": {
              "on": false,
              "count": 2,
              "height": 1290,
              "width": 1200,
              "along": 600,
              "spacing": 300,
              "depth": 200
            },
            "picture": {
              "on": false,
              "height": 1220,
              "width": 680,
              "tall": 1000,
              "along": 660
            }
          },
          "tvWall": {
            "shelves": {
              "on": false,
              "count": 3,
              "height": 1000,
              "width": 1200,
              "along": 1180,
              "spacing": 440,
              "depth": 240
            },
            "picture": {
              "on": false,
              "height": 1430,
              "width": 1200,
              "tall": 1000,
              "along": 1160
            }
          },
          "cornerShelves": {
            "on": false,
            "count": 3,
            "height": 1000,
            "tvLength": 1200,
            "wcLength": 1200,
            "spacing": 440,
            "depth": 240
          },
          "shoeBoxes": {
            "left": {
              "on": false,
              "from": 0,
              "length": 1200,
              "width": 240,
              "height": 300
            },
            "right": {
              "on": false,
              "from": 0,
              "length": 1200,
              "width": 120,
              "height": 300,
              "levelWithLeft": false
            }
          },
          "bathroomShown": true
        },
        "thingsToStore": {
          "shown": true,
          "packing": 0,
          "where": "byHand",
          "spots": [
            {
              "x": -1260,
              "y": 3190,
              "turned": true,
              "z": 0
            },
            {
              "x": -1380,
              "y": 4850,
              "turned": true,
              "z": 0
            },
            {
              "x": -1680,
              "y": 5240,
              "turned": false,
              "z": 0
            },
            {
              "x": -1540,
              "y": 3940,
              "turned": false,
              "z": 0
            },
            {
              "x": -1470,
              "y": 4260,
              "turned": false,
              "z": 0
            },
            {
              "x": 30,
              "y": 420,
              "turned": false,
              "z": 0
            },
            {
              "x": -1370,
              "y": 3190,
              "turned": true,
              "z": 0
            }
          ]
        }
      },
    },
  },
};
