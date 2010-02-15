dojs javascript framework
-------------------------

## include dojs ##

1. include the main.js to your html file. Watch out that you take the right path.
	
		<script type="text/javascript" src="dojs/src/main.js"></script>

2. use dojs.include(files, options) to include the required files

	> files can be an array of strings

			dojs.include(["element.js", "event.js"]);

	> or a string "all" for including all files of dojs

			dojs.include("all");

	> you can set a path which is set in front of all files

			dojs.include(["element.js", "event.js"], {base:"some/other/src"});


