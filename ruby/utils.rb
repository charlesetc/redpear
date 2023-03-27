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

    def self.nanoid(size: 21)
        Nanoid.generate(alphabet: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", size:)
    end
end
