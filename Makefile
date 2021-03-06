include config.mk

PROJECTNAME = linkfinds
HOMEDIR = $(shell pwd)
SSHCMD = ssh $(USER)@$(SERVER)
PRIVSSHCMD = ssh $(PRIVUSER)@$(SERVER)
APPDIR = /opt/$(PROJECTNAME)

pushall: stop-remote sync set-permissions
	git push origin master
	make restart-remote

sync:
	rsync -a $(HOMEDIR) $(USER)@$(SERVER):/opt/ --exclude node_modules/ --exclude data/
	$(SSHCMD) "cd $(APPDIR) && npm install"

set-permissions:
	$(SSHCMD) "chmod +x $(APPDIR)/$(PROJECTNAME)-responder.js"

update-remote: sync set-permissions restart-remote

restart-remote:
	$(PRIVSSHCMD) "service $(PROJECTNAME) restart"

install-service:
	$(PRIVSSHCMD) "cp $(APPDIR)/$(PROJECTNAME).service /etc/systemd/system && \
	systemctl enable $(PROJECTNAME)"

stop-remote:
	$(PRIVSSHCMD) "service $(PROJECTNAME) stop"

check-status:
	$(SSHCMD) "systemctl status $(PROJECTNAME)"

check-log:
	$(SSHCMD) "journalctl -r -u $(PROJECTNAME)"

make-data-dir:
	$(SSHCMD) "mkdir -p $(APPDIR)/data"

test:
	node tests/populate-scene-tests.js
	rm -rf image-output/*
	node tests/integration/interesting-words-tests.js
	node tests/integration/link-finding-images-tests.js

run-multiple:
	number=1 ; while [[ $$number -le 25 ]] ; do \
		node linkfinds-post.js --dry; \
		((number = number + 1)) ; \
	done

update-iscool-and-chime-in:
	git pull origin master && \
		npm update --save iscool && \
		npm update --save can-i-chime-in && \
		git commit -a -m"Updated iscool and can-i-chime-in." && \
		make pushall

# start-local-photo-booth-server:
# 	{ node node_modules/web-photo-booth/tools/start-server.js & \
# 	 echo $$!  > test-photobooth-pid.txt; }

# stop-local-photo-booth-server:
# 	kill $(shell cat test-photobooth-pid.txt)

prettier:
	prettier --single-quote --write "**/*.js"
