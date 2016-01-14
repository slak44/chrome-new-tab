EXTENSION = src.crx
SOURCES = $(wildcard ./src/*.js)
PLUGINS = $(wildcard ./plugins/*.js)
COMPILED_SOURCES = $(SOURCES:./src/%.js=./make/%.js)
COMPILED_PLUGINS = $(PLUGINS:./plugins/%.js=./plugins/make/%.js)

.PHONY: all clean compile

all: $(SOURCES) $(EXTENSION)
	@ln -nfrs -t make `find src -maxdepth 1 -not -name "*.js" | tail -n +2` # symlink everything that's not js to the make folder
	@chromium --pack-extension=make --pack-extension-key=src.pem
	@echo "Built extension"
	
$(EXTENSION): $(COMPILED_SOURCES)

compile: $(SOURCES) $(EXTENSION)

pluginsc: $(COMPILED_PLUGINS)

./make/%.js: ./src/%.js
	@echo "Compiling file" $@ "from" $<
	@touch $@
	@babel $< -o $@

./plugins/make/%.js: ./plugins/%.js
	@echo "Compiling file" $@ "from" $<
	@touch $@
	@babel $< -o $@

clean:
	@echo "Cleaning make folder..."
	@rm -f ./make/*
