// Scenes for the top bar's Scenes list in living_room.js, to show people the
// options: the same on every device, unlike those saved with Save scene. Edit
// freely, then reload the page.
//
// A scene is everything the page shows bar where you're looking from: its
// configuration (room_dimensions.md has the format): the option, the
// dresser, larder, island and sofa, what's above the bench (the TV), sizes,
// colours and the doors. To add one: set the page up as you want it, run
// `copy(JSON.stringify(plans.export(), null, 2))` in the browser's console,
// and paste it in below, as
//
//   id: { label: 'What it shows', configuration: { "version": 1, ... } },
//
// with an id of your own (letters and digits, no spaces). Give it every
// setting, as export() does, so it doesn't change when a default does.
window.ROOM_SCENES = {
  list: {
    // Option 7, the full-height L: 1200 × 1200 outside, each leg 618 deep:
    // the left-wall cupboard 618 deep, the back-wall leg 582 wide and 618
    // deep, the front at 1200. Inside, with 18 rear panels against the walls,
    // 1164 × 582 along the back wall and 582 × 582 along the left. Packed:
    // racks 1 and 2 at the back, against the back-wall rear panel behind the main door;
    // the tub at the front there, on the 790 shelf just above them (they're
    // 630 high, and need 50 to lift them in over the cupboard's bottom);
    // the ladders side by side in the left-wall leg, out through its door,
    // with the hoover right by them, in front of that door, and the mop
    // behind the hoover, in the corner. Shelves: in the back-wall leg and
    // corner 790 (cut back in the corner, for the mop and hoover), 1300 and
    // 1850; in the left-wall leg 1710 (clear of the long ladder) and 2150
    finished7: { label: '7. Finished design, 1200 × 1200, ready packed', title: 'The full-height L, 1200 × 1200, legs 618 deep, packed',
      configuration: {
        "version": 1,
        "doors": {
          "room": 90,
          "tall": 0,
          "second": 0,
          "bedroom": 90,
          "flat": 0,
          "outside": 0
        },
        "colours": {
          "floor": 0,
          "cupboard": 4,
          "wall": 0,
          "woodwork": 0,
          "dresser": 0,
          "carpet": 0,
          "shelves": 0
        },
        "livingRoom": {
          "frontWall": "dresser"
        },
        "pieces": {
          "cornerCupboard": {
            "design": {
              "option": 7,
              "T": 618,
              "R": 330,
              "F": 1200,
              "BOARD": 18,
              "LEG": 582,
              "LEG_D": 618,
              "L_SHELVES": {
                "back": [
                  790,
                  1300,
                  1850
                ],
                "left": [
                  1710,
                  2150
                ]
              },
              "WARD": 900,
              "WARD_D": 600,
              "TOWER": 400,
              "CORNER_W": 800,
              "CORNER_D": 1200,
              "SIDE_SHELF": false,
              "SIDE_W": 400,
              "SIDE_D": 330
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
              "what": "tvAndShelves",
              "shelfDepth": 250,
              "tv": 75
            }
          },
          "dresser": {
            "design": {
              "w": 1370,
              "h": 1940,
              "baseD": 410,
              "baseH": 830,
              "upperD": 340
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
              "model": "none",
              "w": 1690,
              "d": 1000,
              "h": 920
            },
            "in": {
              "livingRoom": {
                "front": 1900,
                "move": null
              }
            }
          },
          "bedroomCupboard": {
            "in": {
              "bedroom": {
                "on": false
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
                "on": true,
                "x": 1425,
                "y": 0,
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
                "on": true,
                "wall": "breast",
                "along": 2569,
                "bottom": 1400
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
                "along": 1370,
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
            "design": {
              "w": 600,
              "d": 200,
              "h": 1200,
              "bevel": false,
              "slope": 30,
              "shoes": true,
              "bevelDoor": 78
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
          "billy": {
            "in": {
              "garage": {
                "on": true,
                "x": 0,
                "y": 1920,
                "turn": 270
              }
            }
          },
          "billyChest": {
            "in": {
              "garage": {
                "on": true,
                "x": 0,
                "y": 1100,
                "turn": 270
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
                "y": 1070,
                "turn": 90,
                "z": 750
              }
            }
          },
          "trellis": {
            "in": {
              "garage": {
                "on": true,
                "x": 730,
                "y": 1160,
                "turn": 90
              }
            }
          }
        },
        "thingsToStore": {
          "shown": true,
          "packing": 0,
          "where": "byHand",
          "spots": [
            {
              "x": 382,
              "y": 18,
              "turned": false,
              "z": 0
            },
            {
              "x": 100,
              "y": 852,
              "turned": false,
              "z": 0
            },
            {
              "x": 40,
              "y": 1077,
              "turned": false,
              "z": 0
            },
            {
              "x": 30,
              "y": 240,
              "turned": false,
              "z": 0
            },
            {
              "x": 30,
              "y": 570,
              "turned": false,
              "z": 0
            },
            {
              "x": 620,
              "y": 45,
              "turned": false,
              "z": 790
            },
            {
              "x": 382,
              "y": 120,
              "turned": false,
              "z": 0
            }
          ]
        }
      },
    },
  },
};
