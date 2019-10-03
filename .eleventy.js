module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");

    return {
        dir: {
			dat: "_data",
            input: "src",
            output: "_site"
        }
    };
};
