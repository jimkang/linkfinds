HOMEDIR = $(shell pwd)
SSHCMD = ssh $(SMUSER)@smidgeo-headporters
PROJECTNAME = linkfinds
APPDIR = /var/apps/$(PROJECTNAME)

pushall: update-remote
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(SMUSER)@smidgeo-headporters:/var/apps/ --exclude node_modules/ --exclude data/
	ssh $(SMUSER)@smidgeo-headporters "cd /var/apps/$(PROJECTNAME) && npm install"

restart-remote:
	$(SSHCMD) "systemctl restart $(PROJECTNAME)"

set-permissions:
	$(SSHCMD) "chmod +x $(APPDIR)/linkfinds-responder.js && \
	chmod 777 -R $(APPDIR)/data/linkfinds-responses.db"

update-remote: sync set-permissions restart-remote

install-service:
	$(SSHCMD) "cp $(APPDIR)/$(PROJECTNAME).service /etc/systemd/system && \
	systemctl daemon-reload"

create-dirs:
	$(SSHCMD) "mkdir -p $(APPDIR)/data"

test: start-local-photo-booth-server
	node tests/integration/interesting-words-tests.js
	node tests/integration/link-finding-images-tests.js
	make stop-local-photo-booth-server

run-multiple:
	number=1 ; while [[ $$number -le 25 ]] ; do \
		node linkfinds-post.js ; \
		((number = number + 1)) ; \
	done

start-local-photo-booth-server:
	{ node node_modules/web-photo-booth/tools/start-server.js & \
	 echo $$!  > test-photobooth-pid.txt; }

stop-local-photo-booth-server:
	kill $(shell cat test-photobooth-pid.txt)
