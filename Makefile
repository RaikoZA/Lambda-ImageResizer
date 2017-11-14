.PHONY: all image package build-dist dist update-zip-contents clean-files remove-docker-image

all: image package build-dist dist update-zip-contents clean-files

image:
	docker build --tag amazonlinux:nodejs .

package: image
	docker run --rm --volume ${PWD}/lambda:/build amazonlinux:nodejs npm install --production

build-dist: package
	npm run build

dist: build-dist
	cd lambda && zip -FS -q -r function.zip *

update-zip-contents: dist
	zip -ur lambda/function.zip dist

clean-files:
	rm -r lambda/node_modules
	rm -r dist

remove-docker-image:
	docker rmi --force amazonlinux:nodejs
