/**
 * Class representing the properties of a Phong material.
 */
export default class PhongProperties {

    ambient: number;
    diffuse: number;
    specular: number;
    shininess: number;

    /**
     * Constructs a new instance of the PhongProperties class.
     */
    constructor() {
        let phongValues = this.getPhongPropertyValues();
        this.ambient = phongValues.get('ambient_value');
        this.diffuse = phongValues.get('diffuse_value');
        this.specular = phongValues.get('specular_value');
        this.shininess = phongValues.get('shininess_value');
    }

    /**
     * Retrieves the values of Phong properties from the corresponding HTML sliders.
     * @returns A map containing the Phong property names as keys and their corresponding values as values.
     */
    getPhongPropertyValues(): Map<string, number> {
        let map = new Map<string, number>();
        let phongSliders = ['ambient_value', 'diffuse_value', 'specular_value', 'shininess_value'];
        phongSliders.forEach(function (e: string) {
            console.log(e);
            map.set(e, +((document.getElementById(e) as HTMLInputElement).value));
        });
        return map;
    }
}

