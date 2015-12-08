EXTENSION = src.crx
SOURCES = $(wildcard ./src/*.js)
OBJECTS = $(SOURCES:./src/%.js=./make/%.js)

.PHONY: all clean cleanph

all: $(SOURCES) $(EXTENSION)
	@chromium --pack-extension=src --pack-extension-key=src.pem
	@echo "Built extension"
	
$(EXTENSION): $(OBJECTS)

./make/%.js: ./src/%.js
	@echo "Compiling file: $@"
	@babel $< -o $@

clean:
	@echo "Cleaning make folder..."
	@rm -f ./make/*
