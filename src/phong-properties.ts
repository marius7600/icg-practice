export default class PhongProperties {

    ambient: number;
    diffuse: number;
    specular: number;
    shininess: number;

    // PhongProperties get declared with current slider Values
    constructor() {
        let phongValues = this.getPhongPropertyValues();
        this.ambient = phongValues.get('ambient_value');
        this.diffuse = phongValues.get('diffuse_value');
        this.specular = phongValues.get('specular_value');
        this.shininess = phongValues.get('shininess_value');
    }

    /**
     * @return Map with phong attributes and their values
     * key = phongSlider
     * value = number of phong attribute
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

