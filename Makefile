test:
	@JUNIT_REPORT_PATH=tests/results/junit.xml JUNIT_REPORT_STACK=1 ./node_modules/mocha/bin/mocha "./tests/*.js" -u tdd --reporter mocha-jenkins-reporter || true	
.PHONY: test