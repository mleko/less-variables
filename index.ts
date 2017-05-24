import * as fs from "fs";
import * as less_ from "less";
import * as path from "path";

const less = less_ as any;

type VarCallback = (vars: {[id: string]: any}) => void;

export const lessVariables = (filepath: string, callback: VarCallback) => {

	const src = fs.readFileSync(filepath, {encoding: "utf8"});

	const options = {
		paths: [path.dirname(filepath)]
	};

	const parseCallback = (error, root, imports, opts) => {
		if (error) {
			throw error;
		}
		const evalEnv = new less.contexts.Eval(opts);
		const evaldRoot = root.eval(evalEnv);
		const ruleset = evaldRoot.rules;
		const variables = {};
		ruleset
			.filter((rule) => {
				return rule.variable;
			})
			.forEach((rule) => {
				if (rule.value && rule.name) {
					variables[rule.name] = rule.value.toCSS(opts);
				}
			});
		callback(variables);
	};
	less.parse(src, options, parseCallback);
};
