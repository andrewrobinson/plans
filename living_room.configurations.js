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
        "version": 2,
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
          "frontWall": "none",
          "firstRadiator": true
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": false,
                "tvAbove": false,
                "chair": "small",
                "move": null
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "none",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "right",
            "mustOpenTo": 90,
            "swingShown": false
          }
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
        "version": 2,
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
          "frontWall": "none",
          "firstRadiator": true
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": false,
                "tvAbove": false,
                "chair": "small",
                "move": null
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "none",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "right",
            "mustOpenTo": 90,
            "swingShown": false
          }
        },
        "thingsToStore": {
          "shown": true,
          "packing": 0,
          "where": "cupboard"
        }
      },
    },
    // Pretty (20 Oct 2026), the user's: Option 12 as they set it from its
    // link, the corner cupboard cut back to 327 out along the left wall
    // (level with the side bookshelf) and 1880 high (inside it's 864 × 291,
    // too shallow for the things to store) and the kitchen tables hidden; its fold-down desk off, as the bookshelf covers the
    // cupboard's side, and the desk on castors parked by the door in its
    // place. The bedroom from their second link, as updated from their link
    // of 22 Oct 2026: the new cupboard on, as option 8 with its diagonal
    // (T 400, R 300, F 1967, DIAG_RUN 1458, its straight fronts 1090 and
    // 1240), clear of the bedroom door, which swings left going in, its swing
    // shown on the floor; the bookcase, the pine cupboard and the bedside
    // table by it out, and the recess cupboards 448 deep. The things to store
    // hidden, still placed by hand from their third link (in the bedroom's new
    // cupboard as it was, bar the yellow tub, left in the lounge by the
    // corner cupboard)
    pretty: { label: 'Pretty', title: 'Option 12 with a 327-deep, 1880-high corner cupboard and the desk on castors parked by the door; the bedroom with the new cupboard as option 8 and its door swinging left',
      configuration: {
        "version": 2,
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
          "frontWall": "none",
          "firstRadiator": true
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
              "T": 400,
              "R": 300,
              "F": 1967,
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
              "DIAG_RUN": 1458,
              "DIAG_BACK": 1090,
              "DIAG_LEFT": 1240,
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": false,
                "tvAbove": false,
                "chair": "small",
                "move": null
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "none",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "left",
            "mustOpenTo": 90,
            "swingShown": true
          }
        },
        "thingsToStore": {
          "shown": false,
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
    // Daybed (22 Oct 2026), the user's, from their link: Pretty with the
    // lounge round the daybed. The daybed with its desk on the back wall,
    // its TV on the wall above it and the speakers on its bookcase; the
    // corner cupboard as option 11 (its doors facing the windows), 540 along
    // the back wall and out to the door frame (1329), 2010 high, R 340; the
    // Merton sofa facing the TV; the desk on castors out. The bedroom as
    // Pretty's
    daybed: { label: 'Daybed', title: 'Pretty with the daybed on the back wall, its TV above and the speakers on it, an option 11 corner cupboard out to the door frame, and the Merton sofa',
      configuration: {
        "version": 2,
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
          "frontWall": "none",
          "firstRadiator": true
        },
        "pieces": {
          "cornerCupboard": {
            "design": {
              "option": 11,
              "T": 600,
              "R": 340,
              "F": 1200,
              "BOARD": 18,
              "TOP": 2010,
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
              "CORNER_W": 540,
              "CORNER_D": 1329,
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
              "T": 400,
              "R": 300,
              "F": 1967,
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
              "DIAG_RUN": 1458,
              "DIAG_BACK": 1090,
              "DIAG_LEFT": 1240,
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
              "model": "merton",
              "w": 1690,
              "d": 1000,
              "h": 920,
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": true,
                "tvAbove": true,
                "chair": "small",
                "move": {
                  "x": 2285,
                  "y": 0,
                  "turn": 0
                }
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "deskDaybed",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "left",
            "mustOpenTo": 90,
            "swingShown": true
          }
        },
        "thingsToStore": {
          "shown": false,
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
      } },
    // L1 (22 Oct 2026, notes/PERMUTATIONS.md): Daybed with someone at the daybed's
    // desk: the first window's radiator out, the daybed flush to the window
    // wall and the option 11 corner cupboard 700 along the back wall, leaving
    // 486 for the chair (the office chair 16 to spare); the dresser on the
    // front wall; the excluded pieces out (the bedside tables, the laundry
    // basket). The things to store packed in the cupboard: 5 of 7 fit
    l1: { label: 'L1 Daybed, chair', title: 'The daybed flush to the window wall (the first radiator out) with the smaller chair at its desk, an option 11 corner cupboard 700 along the back wall and out to the door frame, the dresser',
      configuration: {
        "version": 2,
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
          "frontWall": "dresser",
          "firstRadiator": false
        },
        "pieces": {
          "cornerCupboard": {
            "design": {
              "option": 11,
              "T": 600,
              "R": 340,
              "F": 1200,
              "BOARD": 18,
              "TOP": 2010,
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
              "CORNER_W": 700,
              "CORNER_D": 1329,
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
              "T": 400,
              "R": 300,
              "F": 1967,
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
              "DIAG_RUN": 1458,
              "DIAG_BACK": 1090,
              "DIAG_LEFT": 1240,
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
              "model": "merton",
              "w": 1690,
              "d": 1000,
              "h": 920,
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
                "on": false,
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
                "on": false,
                "wall": "hallway",
                "along": 400
              }
            }
          },
          "laundryBasket": {
            "in": {
              "bedroom": {
                "on": false,
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": true,
                "tvAbove": true,
                "chair": "small",
                "move": {
                  "x": 2523,
                  "y": 0,
                  "turn": 0
                }
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "deskDaybed",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "left",
            "mustOpenTo": 90,
            "swingShown": true
          }
        },
        "thingsToStore": {
          "shown": true,
          "packing": 0,
          "where": "cupboard"
        }
      } },
    // L2 (22 Oct 2026, notes/PERMUTATIONS.md): the daybed with no chair at its desk,
    // so the corner cupboard can be wide: Option 12's, option 10 at 900 × 1150,
    // 2050 high, without its side bookshelf or fold-down desk, the things to
    // store packed in it; otherwise as L1
    l2: { label: 'L2 Daybed, no chair', title: 'The daybed with no chair at its desk, Option 12\'s 900 × 1150 corner cupboard holding the things to store, the dresser',
      configuration: {
        "version": 2,
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
          "frontWall": "dresser",
          "firstRadiator": true
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
              "option": 8,
              "T": 400,
              "R": 300,
              "F": 1967,
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
              "DIAG_RUN": 1458,
              "DIAG_BACK": 1090,
              "DIAG_LEFT": 1240,
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
              "model": "merton",
              "w": 1690,
              "d": 1000,
              "h": 920,
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
                "on": false,
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
                "on": false,
                "wall": "hallway",
                "along": 400
              }
            }
          },
          "laundryBasket": {
            "in": {
              "bedroom": {
                "on": false,
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": true,
                "tvAbove": true,
                "chair": "none",
                "move": {
                  "x": 2285,
                  "y": 0,
                  "turn": 0
                }
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "deskDaybed",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "left",
            "mustOpenTo": 90,
            "swingShown": true
          }
        },
        "thingsToStore": {
          "shown": true,
          "packing": 0,
          "where": "cupboard"
        }
      } },
    // L3 (22 Oct 2026, notes/PERMUTATIONS.md): the bench in place of the daybed:
    // Option 12's corner cupboard (option 10 at 900 × 1150, 2050 high, its lit
    // side bookshelf, no fold-down desk) holding the things to store, the
    // bench, its TV and top shelf, the speakers on the bench; otherwise as L1
    l3: { label: 'L3 Bench', title: 'Option 12\'s corner cupboard and side bookshelf holding the things to store, the bench with its TV, top shelf and the speakers, the dresser',
      configuration: {
        "version": 2,
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
          "frontWall": "dresser",
          "firstRadiator": true
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
              "DESK": false,
              "DESK_W": 780,
              "DESK_D": 500,
              "DESK_H": 740
            }
          },
          "bedroomCupboard": {
            "design": {
              "option": 8,
              "T": 400,
              "R": 300,
              "F": 1967,
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
              "DIAG_RUN": 1458,
              "DIAG_BACK": 1090,
              "DIAG_LEFT": 1240,
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
              "model": "merton",
              "w": 1690,
              "d": 1000,
              "h": 920,
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
                "on": false,
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
                "on": false,
                "wall": "hallway",
                "along": 400
              }
            }
          },
          "laundryBasket": {
            "in": {
              "bedroom": {
                "on": false,
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": false,
                "tvAbove": true,
                "chair": "small",
                "move": {
                  "x": 2285,
                  "y": 0,
                  "turn": 0
                }
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "bench",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "left",
            "mustOpenTo": 90,
            "swingShown": true
          }
        },
        "thingsToStore": {
          "shown": true,
          "packing": 0,
          "where": "cupboard"
        }
      } },
    // a1 narrow (22 Oct 2026, notes/PERMUTATIONS.md, route a, step 1 towards L1):
    // today's rooms (18 October 2026) with the excluded pieces gone (BillyChest, the Ivar, the tables, the dark bookcase, the bedside tables, the Kvistbro, the laundry basket), the Drift, no TV, nothing on the front wall;
    // L1's corner cupboard (option 11, 730 along the back wall, out to the door
    // frame), Billy still the bench with the speakers on it, the pine cupboard
    // still in the bedroom; the things to store hidden
    a1n: { label: 'a1 Narrow cupboard', title: 'Route a, step 1: L1\'s narrow corner cupboard, Billy still the bench, the Drift, the pine cupboard still in the bedroom',
      configuration: {
        "version": 2,
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
          "frontWall": "none",
          "firstRadiator": true
        },
        "pieces": {
          "cornerCupboard": {
            "design": {
              "option": 11,
              "T": 600,
              "R": 340,
              "F": 1200,
              "BOARD": 18,
              "TOP": 2010,
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
              "CORNER_W": 700,
              "CORNER_D": 1329,
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
                "on": false,
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
                "on": false,
                "wall": "hallway",
                "along": 400
              }
            }
          },
          "laundryBasket": {
            "in": {
              "bedroom": {
                "on": false,
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": false,
                "tvAbove": false,
                "chair": "small",
                "move": null
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "billy",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "right",
            "mustOpenTo": 90,
            "swingShown": false
          }
        },
        "thingsToStore": {
          "shown": false,
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
      } },
    // a1 wide (route a, step 1 towards L2 or L3): as a1 narrow, with L2's
    // corner cupboard (option 10, 900 × 1150, 2050 high, no side bookshelf),
    // the things to store packed in it
    a1w: { label: 'a1 Wide cupboard', title: 'Route a, step 1: Option 12\'s 900 × 1150 corner cupboard holding the things to store, Billy still the bench, the Drift',
      configuration: {
        "version": 2,
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
          "frontWall": "none",
          "firstRadiator": true
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
                "on": false,
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
                "on": false,
                "wall": "hallway",
                "along": 400
              }
            }
          },
          "laundryBasket": {
            "in": {
              "bedroom": {
                "on": false,
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": false,
                "tvAbove": false,
                "chair": "small",
                "move": null
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "billy",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "right",
            "mustOpenTo": 90,
            "swingShown": false
          }
        },
        "thingsToStore": {
          "shown": true,
          "packing": 0,
          "where": "cupboard"
        }
      } },
    // b1 (route b, step 1): today's rooms (18 October 2026) with the excluded pieces gone (BillyChest, the Ivar, the tables, the dark bookcase, the bedside tables, the Kvistbro, the laundry basket), the Drift, no TV, nothing on the front wall;
    // the bedroom's new cupboard as Pretty's (option 8, its door swinging
    // left), the pine cupboard out of the bedroom; the lounge as today, Billy
    // the bench with the speakers on it, the things to store on the floor
    b1: { label: 'b1 Bedroom cupboard', title: 'Route b, step 1: the bedroom\'s new cupboard (option 8), the lounge as today with Billy and the Drift',
      configuration: {
        "version": 2,
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
          "frontWall": "none",
          "firstRadiator": true
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
              "option": 8,
              "T": 400,
              "R": 300,
              "F": 1967,
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
              "DIAG_RUN": 1458,
              "DIAG_BACK": 1090,
              "DIAG_LEFT": 1240,
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
                "on": false,
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
                "on": false,
                "wall": "hallway",
                "along": 400
              }
            }
          },
          "laundryBasket": {
            "in": {
              "bedroom": {
                "on": false,
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": false,
                "tvAbove": false,
                "chair": "small",
                "move": null
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "billy",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "left",
            "mustOpenTo": 90,
            "swingShown": true
          }
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
      } },
    // b2 (route b): b1 with the pine cupboard in the lounge's corner by the
    // door, 60 off both walls, its back to the left wall (standing in for
    // the corner cupboard); the things to store hidden
    b2: { label: 'b2 Pine, Billy', title: 'Route b: the pine cupboard in the lounge\'s corner by the door, Billy still the bench, the Drift',
      configuration: {
        "version": 2,
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
          "frontWall": "none",
          "firstRadiator": true
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
              "option": 8,
              "T": 400,
              "R": 300,
              "F": 1967,
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
              "DIAG_RUN": 1458,
              "DIAG_BACK": 1090,
              "DIAG_LEFT": 1240,
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
                "on": true,
                "move": {
                  "x": 60,
                  "y": 710,
                  "turn": 270
                }
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
                "on": false,
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
                "on": false,
                "wall": "hallway",
                "along": 400
              }
            }
          },
          "laundryBasket": {
            "in": {
              "bedroom": {
                "on": false,
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": false,
                "tvAbove": false,
                "chair": "small",
                "move": null
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "billy",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "left",
            "mustOpenTo": 90,
            "swingShown": true
          }
        },
        "thingsToStore": {
          "shown": false,
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
      } },
    // P1 (route b): b2 with the daybed in Billy's place, flush to the window
    // wall, the first window's radiator taken out, the smaller chair at its
    // desk and the speakers on it; the Drift facing the back wall
    p1: { label: 'P1 Pine, daybed', title: 'Route b: the pine cupboard by the door, the daybed flush to the window wall (the radiator out) with the smaller chair, the Drift',
      configuration: {
        "version": 2,
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
          "frontWall": "none",
          "firstRadiator": false
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
              "option": 8,
              "T": 400,
              "R": 300,
              "F": 1967,
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
              "DIAG_RUN": 1458,
              "DIAG_BACK": 1090,
              "DIAG_LEFT": 1240,
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
                "on": true,
                "move": {
                  "x": 60,
                  "y": 710,
                  "turn": 270
                }
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
                "on": false,
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
                "on": false,
                "wall": "hallway",
                "along": 400
              }
            }
          },
          "laundryBasket": {
            "in": {
              "bedroom": {
                "on": false,
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": true,
                "tvAbove": false,
                "chair": "small",
                "move": {
                  "x": 2523,
                  "y": 0,
                  "turn": 0
                }
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "deskDaybed",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "left",
            "mustOpenTo": 90,
            "swingShown": true
          }
        },
        "thingsToStore": {
          "shown": false,
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
      } },
    // P3 (route b): b2 with the bench in Billy's place, starting past the
    // pine cupboard, nothing above it, the speakers on it; the Drift facing
    // the back wall
    p3: { label: 'P3 Pine, bench', title: 'Route b: the pine cupboard by the door, the bench past it with the speakers, the Drift',
      configuration: {
        "version": 2,
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
          "frontWall": "none",
          "firstRadiator": true
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
              "option": 8,
              "T": 400,
              "R": 300,
              "F": 1967,
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
              "DIAG_RUN": 1458,
              "DIAG_BACK": 1090,
              "DIAG_LEFT": 1240,
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
              "what": "nothing",
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
                "on": true,
                "move": {
                  "x": 60,
                  "y": 710,
                  "turn": 270
                }
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
                "on": false,
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
                "on": false,
                "wall": "hallway",
                "along": 400
              }
            }
          },
          "laundryBasket": {
            "in": {
              "bedroom": {
                "on": false,
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
          "deskDaybed": {
            "design": {
              "deskAt": "left"
            },
            "in": {
              "livingRoom": {
                "on": false,
                "tvAbove": false,
                "chair": "small",
                "move": null
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
          "speakers": {
            "in": {
              "livingRoom": {
                "on": "bench",
                "spacing": {
                  "bench": null,
                  "billy": null,
                  "deskDaybed": null
                }
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
        "bedroom": {
          "door": {
            "swings": "left",
            "mustOpenTo": 90,
            "swingShown": true
          }
        },
        "thingsToStore": {
          "shown": false,
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
      } },
  },
};
