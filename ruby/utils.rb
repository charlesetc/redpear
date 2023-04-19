require "nanoid"

module Utils
    def self.adjectives
        [
            'Lovely',
            'Beautiful',
            'Funny',
            'Indie',
            'Sunny',
            'Windy',
            'Calm',
            'Silver',
            'Golden',
            'Rainy',
            'Quiet',
            'Peaceful',
            'Cloudy',
            'Vintage',
            'Soft',
            'Gentle',
            'Sweet',
            'Serene',
            'Joyful',
            'Iconic',
            'Amazing',
            'Idyllic',
            'Elysian',
            'Rustic',
            'Delightful',
            'Charming',
            'Romantic',
            'Dramatic',
            'Lively',
            'Colorful',
            'Dazzling',
            'Sunny',
            'Warm',
            'Dreamy',
            'Favorite',
            'Grandest',
            'Cute',
            'Magical',
        ]
    end

    def self.nouns
        [
            'Place',
            'Room',
            'Record',
            'Space',
            'Sunset',
            'Sunrise',
            'Morning',
            'Afternoon',
            'Evening',
            'Balcony',
            'Bedroom',
            'Meadow',
            'Garden',
            'Walk',
            'Stroll',
            'Piano',
            'Violin',
            'Watch',
            'Winter',
            'Spring',
            'Autumn',
            'Summer',
            'Moment',
            'Breakfast',
            'Coffee',
            'Tea',
            'Pastry',
            'Chocolate',
            'Dream',
            'Pasture',
            'Field',
            'Farm',
            'Cottage',
            'Cabin',
            'Home',
            'Apartment',
            'Patina',
            'Teatime',
            'Soirée',
            'Guitar',
            'Day',
            'Month',
            'Year',
            'Decade',
            'Hour',
            'Bunny',
            'Kitty',
            'Puppy',
            'Forest',
            'Clearing',
        ]
    end

    def self.articles
        [
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'My',
            'My',
            'My',
            'My',
            'My',
            'My',
            'My',
            'My',
            'My',
            'My',
            'My',
            'My',
            'My',
            'My',
            'My',
            'My',
            'The',
            'The',
            'The',
            'The',
            'Your',
            'Your',
            'Your',
            'Your',
            'Our',
            'Our',
            'Her',
            'Her',
            'His',
            'His',
            'Their'
        ]
    end

    def self.more_nouns
      [
        "Adventure",
        "Allure",
        "Amazement",
        "Amber",
        "Art",
        "Autumn",
        "Beach",
        "Beacon",
        "Bicycle",
        "Bikeride",
        "Birch",
        "Blanket",
        "Bliss",
        "Bloom",
        "Bonfire",
        "Bonsai",
        "Bookstore",
        "Bounty",
        "Bouquet",
        "Breeze",
        "Bridge",
        "Brisk",
        "Butterflies",
        "Cabin",
        "Cafe",
        "Calmness",
        "Campfire",
        "Campsite",
        "Candlelight",
        "Canoe",
        "Canopy",
        "Cascade",
        "Celestial",
        "Charm",
        "Charming",
        "Cherish",
        "Cherry",
        "Coastline",
        "Cobblestone",
        "Coffee",
        "Cottage",
        "Countryside",
        "Cozy",
        "Crisp",
        "Crunchy",
        "Dancing",
        "Dazzle",
        "Delight",
        "Dewdrops",
        "Dewy",
        "Dream",
        "Dreamland",
        "Driftwood",
        "Dusk",
        "Elegance",
        "Enchanted",
        "Enchantment",
        "Enigma",
        "Enlightenment",
        "Envelop",
        "Epic",
        "Ethereal",
        "Expanse",
        "Exquisite",
        "Fantasy",
        "Farmhouse",
        "Fern",
        "Ferns",
        "Field",
        "Fireflies",
        "Fireside",
        "Fireworks",
        "Flannel",
        "Flicker",
        "Flourish",
        "Flower",
        "Foliage",
        "Folly",
        "Forest",
        "Fountain",
        "Garden",
        "Gazebo",
        "Glamour",
        "Gleam",
        "Gleaming",
        "Gleeful",
        "Glimmer",
        "Glitter",
        "Glorious",
        "Glory",
        "Glow",
        "Goddess",
        "Gondola",
        "Grace",
        "Guitar",
        "Hammock",
        "Harbor",
        "Harmony",
        "Harvest",
        "Hayride",
        "Hike",
        "Hiking",
        "Hot",
        "Idyllic",
        "Jewels",
        "Journal",
        "Journey",
        "Kaleidoscope",
        "Kite",
        "Lake",
        "Lakeside",
        "Lantern",
        "Laughter",
        "Leaves",
        "Leisure",
        "Lighthouse",
        "Lively",
        "Lullaby",
        "Luminous",
        "Majesty",
        "Marina",
        "Meadow",
        "Mist",
        "Misty",
        "Moonbeam",
        "Moonlight",
        "Moss",
        "Mossy",
        "Mountain",
        "Mug",
        "Music",
        "Ocean",
        "Orchard",
        "Path",
        "Peach",
        "Pebble",
        "Pebbles",
        "Petal",
        "Piano",
        "Picnic",
        "Pinecone",
        "Pond",
        "Ponder",
        "Pristine",
        "Pumpkin",
        "Quaint",
        "Quirky",
        "Rainbow",
        "Raindrop",
        "Rays",
        "Reflection",
        "Reverie",
        "Roadtrip",
        "Roam",
        "Roaming",
        "Roller",
        "Rustic",
        "Rustling",
        "Sailboat",
        "Savor",
        "Scent",
        "Seagulls",
        "Seashell",
        "Serenade",
        "Ski",
        "Songbird",
        "Sparkle",
        "Sparkling",
        "Spectacle",
        "Squirrels",
        "Star",
        "Stardust",
        "Starlight",
        "Starry",
        "Sunbeam",
        "Sunburst",
        "Sundial",
        "Sunflower",
        "Sunrise",
        "Sunset",
        "Tea",
        "Trail",
        "Trails",
        "Tranquil",
        "Tranquility",
        "Treats",
        "Tulip",
        "Twilight",
        "Twinkle",
        "Valley",
        "Vibrance",
        "Vineyard",
        "Vintage",
        "Voyage",
        "Wanderlust",
        "Waterfall",
        "Waterfront",
        "Waves",
        "Whimsy",
        "Whiskers",
        "Whisper",
        "Wildflowers",
        "Wistful",
        "Wonderland",
        "Wonders"
      ]
    end

    def self.generate_project_name()
        adjective = adjectives.shuffle.first
        article = articles.shuffle.first
        article = article == 'A' ? 'AEIOU'.include?(adjective[0]) ? "An" : "A" : article
        "#{article} #{adjective} #{nouns.shuffle.first}"
    end

    def self.generate_function_name()
        adjective = adjectives.shuffle.first.downcase
        noun = nouns.shuffle.first.downcase
        "#{adjective}_#{noun}"
    end

    def self.generate_template_name()
      more_nouns.shuffle.first
    end


    def self.nanoid(size: 21)
        Nanoid.generate(alphabet: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", size:)
    end
end
