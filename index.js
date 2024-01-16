import fetch from "node-fetch";

const keyWords = ["override", "dynamic", "var"];

const snakeToPascal = (str) =>
    str.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");

const generateFunctionArguments = (params) => {
    return params.map((param) => {
        let paramName = keyWords.includes(param.name) ? `_${param.name}` : param.name;
        return `${paramName}: ${typeToHaxeType(param.type)}`;
    }).join(", ");
};


const typeToHaxeType = (type) => {
    switch (type.toLowerCase().replace("*", "")) {
        case "int":
            return "Int";
        case "float":
            return "Float";
        case "string":
            return "String";
        case "bool":
            return "Bool";
        case "object":
            return "Dynamic";
        case "char":
            return "String";
        case "vector3":
            return "Vector3";
        case "void":
            return "Void";
        default:
            return "Int";
    }
}

const response = await fetch("https://runtime.fivem.net/doc/natives.json");
const json = await response.json();
const declarations = [];
Object.entries(json).forEach(([nameSpace, natives]) => {
    Object.entries(natives).forEach(([hash, native]) => {
        if (!native.name || native.name.startsWith("0x")) return;
        declarations.push(`static function ${snakeToPascal(native.name)}(${generateFunctionArguments(native.params)}): ${typeToHaxeType(native.results)};`);
    });
});

const template = `class Vector3 {
	extern public var x:Float;
	extern public var y:Float;
	extern public var z:Float;
}

@:native("_G")
extern class Natives {
    static function vector3(x:Float, y:Float, z:Float):Vector3;
    ${declarations.join("\n    ")}
}
`;

console.log(template);
