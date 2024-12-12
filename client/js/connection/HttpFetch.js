export class HttpFetch extends Http {
    obtenerUI(route, callBackOnSuccess){
        fetch(`${this.base_url}/${route}`).then(
            (response) => {
                response.json().then(
                    (data) => {
                        callBackOnSuccess(data);
                    }
                , (error) =>{
                    this.last_error = error;
                })
            }
        , (error) =>{
            this.last_error = error;
        }
    )}
}
