EXTENSION = src.crx
SOURCES = $(wildcard ./src/*.js)
OBJECTS = $(SOURCES:./src/%.js=./make/%.js)

.PHONY: all clean compile

all: $(SOURCES) $(EXTENSION)
	@ln -nfrs -t make `find src -maxdepth 1 -not -name "*.js" | tail -n +2` # symlink everything that's not js to the make folder
	@chromium --pack-extension=make --pack-extension-key=src.pem
	@echo "Built extension"
	
$(EXTENSION): $(OBJECTS)

compile: $(SOURCES) $(EXTENSION)

./make/%.js: ./src/%.js
	@echo "Compiling file" $@ "from" $<
	@touch $@
	@babel $< -o $@

clean:
	@echo "Cleaning make folder..."
	@rm -f ./make/*
