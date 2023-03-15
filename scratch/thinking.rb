def myfunction()
    return x * x
end

def randomSomething()

end

get('/') do
    return "hi"
end

get '/:id' do
    return 'wow'
end

post '/this' do
    :user.something()
    redirect '/somewhere'
end

get '/' do
end
