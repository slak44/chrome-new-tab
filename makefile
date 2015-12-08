EXTENSION = src.crx
SOURCES = $(wildcard ./src/*.js)
OBJECTS = $(SOURCES:./src/%.js=./make/%.js)

.PHONY: all clean compile

all: $(SOURCES) $(EXTENSION)
	@touch make
	@touch make/tmp
	@mv src/*.js make/tmp
	@mv make/*.js src/
	@chromium --pack-extension=src --pack-extension-key=src.pem
	@mv src/*.js make/
	@mv make/tmp/* src/
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
