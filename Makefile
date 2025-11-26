.PHONY: build copy-assets copy-fonts copy-glsl clean

all: build copy-assets copy-fonts copy-glsl

build:
	npm run build

copy-assets:
	mkdir -p dist/assets
	cp -r src/assets dist/

copy-fonts:
	mkdir -p dist/fonts
	cp -r src/fonts dist/

copy-glsl:
	mkdir -p dist/glsl
	cp -r src/glsl dist/

clean:
	rm -rf dist
