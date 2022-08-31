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
        
        // const shininess = 16.0;
        // const kA = 0.3;
        // const kD = 0.6;
        // const kS = 0.7;

        // this.ambient = kA;
        // this.diffuse = kD;
        // this.specular = kS;
        // this.shininess = shininess;
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

