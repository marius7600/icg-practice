// Class representing the properties of a Phong material
export default class PhongProperties {
    shiny: number;
    ambient: number;
    diffuse: number;
    specular: number;

    constructor() {
        let phongValues = this.getPhongPropertyValues();
        this.shiny = phongValues.get('shininess_value');
        this.ambient = phongValues.get('ambient_value');
        this.diffuse = phongValues.get('diffuse_value');
        this.specular = phongValues.get('specular_value');
    }
    
    updatePhongProperties(shiny: number,
        ambient: number,
        diffuse: number,
        specular: number) {
        this.shiny = shiny;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }
    getPhongPropertyValues(): Map<string, number> {
        let map = new Map<string, number>();
        let phongSliders = ['shininess_value', 'ambient_value', 'diffuse_value', 'specular_value'];
        phongSliders.forEach(function (e: string) {
        /**
         * key = phongSlider
         * value = number of phong attribute
         */
        map.set(e, +((document.getElementById(`${e}`) as HTMLInputElement).value));
        }.bind(this));
        return map;
    }
}