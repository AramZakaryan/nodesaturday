import request from "supertest"
import {ReqAddressBodyModel} from "../src/models/reqAddressesModels";
import {ResAddressModel} from "../src/models/resAddressesModels";
import {app} from "../src/app";
import {ResProductModel} from "../src/models/resProductsModels";
import {ReqProductBodyModel, ReqProductsBodyType} from "../src/models/reqProductsModels";


describe("/api", () => {
    it("All products should be received correctly", async () => {
        await request(app)
            .get('/products')
            .expect(200, [
                {title: "tomato"},
                {title: "orange"}
            ])
    })


    it("Products containing letter 'o' should be received correctly", async () => {
        await request(app)
            .get('/products')
            .query({title: "o"})
            .expect(200, [
                {title: "tomato"},
                {title: "orange"}
            ])
    })

    it("Product containing letter 't' should be received correctly", async () => {
        await request(app)
            .get('/products')
            .query({title: "t"})
            .expect(200, [
                {title: "tomato"}
            ])
    })

    it("Product with name 'orange' should be received correctly", async () => {
        await request(app)
            .get('/products/orange')
            .expect(200,
                {title: "orange"}
            )
    })

    it("Should return 404 for not existing product", async () => {
        await request(app)
            .get('/products/cucumber')
            .expect(404)
    })

    it("Product should be deleted correctly", async () => {
        const title = 'orange'
        const initialProducts: ResProductModel[] = await request(app).get('/products').then(res => res.body)
        expect(initialProducts.find(p => p.title === title)).toEqual({title: "orange"})

        await request(app)
            .delete(`/products/${title}`)
            .expect(204)

        const finalProducts: ResProductModel[] = await request(app).get('/products').then(res => res.body)
        expect(finalProducts.length).toBe(initialProducts.length - 1)
        expect(finalProducts.find(p => p.title === title)).toBeUndefined()

    })

    it("Should return 404 for not existing product in case of delete", async () => {

        await request(app)
            .delete('/products/cucumber')
            .expect(404)

    })


    it("Product title (name) should be updated correctly", async () => {

        const initialTitle = "tomato"
        const finalTitle = "potato"

        const reqProductBody: ReqProductBodyModel = {title: finalTitle}
        const resProduct: ResProductModel = reqProductBody

        // sub-test 1
        await request(app)
            .put(`/products/${initialTitle}`)
            .send(reqProductBody)
            .expect(resProduct)

        // sub-test 2
        const resProductGet: ResProductModel[] = await request(app).get('/products').then(res => res.body)
        expect(resProductGet.find(p => p.title === finalTitle)).not.toBeUndefined()
    })

    it("Should create new product", async () => {

        const initialState: ResProductModel[] = await request(app).get('/products').then(res => res.body)

        const reqProductBody: ResProductModel = {title: "Some Product"}
        const resProduct: ResProductModel = reqProductBody

        await request(app)
            .post('/products')
            .send(reqProductBody)
            .expect(201,
                resProduct)

        const finalState: ResProductModel[] = await request(app).get('/products').then(res => res.body)
        expect(finalState.length).toBe(initialState.length + 1)
        expect(finalState[finalState.length - 1]).toEqual(resProduct)
    })

    it("Should return error where product request body value is empty, " +
        "less than 3 or more than 20 letters" +
        "(cases of post)", async () => {

        let reqProductBody: ReqProductBodyModel

        const errorEmpty = {
            type: "field",
            value: "",
            msg: "Shall not be empty",
            path: "title",
            location: "body"
        }

        const errorMinMax = {
            type: "field",
            value: "",
            msg: "length should be from 3 to 20",
            path: "title",
            location: "body"
        }

        // sub-test 1. Empty request body value

        reqProductBody = {title: ""}

        const error1put = await request(app).put('/products/tomato').send(reqProductBody).then(res => res.body)
        expect(error1put).toEqual({errors: [errorEmpty, errorMinMax]})

        const error1post = await request(app).post('/products').send(reqProductBody).then(res => res.body)
        expect(error1post).toEqual({errors: [errorEmpty, errorMinMax]})

        // sub-test 2. Request body value less than 3 letters

        reqProductBody = {title: "a"}

        const error2put = await request(app).put('/products/tomato').send(reqProductBody).then(res => res.body)
        expect(error2put).toEqual({errors: [{...errorMinMax, value: "a"}]})

        const error2post = await request(app).post('/products').send(reqProductBody).then(res => res.body)
        expect(error2post).toEqual({errors: [{...errorMinMax, value: "a"}]})

        // sub-test 3. Request body value more than 20 letters

        reqProductBody = {title: "123456789012345678901"}

        const error3put = await request(app).put('/products/tomato').send(reqProductBody).then(res => res.body)
        expect(error3put).toEqual({errors: [{...errorMinMax, value: "123456789012345678901"}]})

        const error3post = await request(app).post('/products').send(reqProductBody).then(res => res.body)
        expect(error3post).toEqual({errors: [{...errorMinMax, value: "123456789012345678901"}]})

    })

    it("All addresses should be received correctly", async () => {
        await request(app)
            .get('/addresses')
            .expect(200, [
                {id: 1, value: "Mira 7"},
                {id: 2, value: "Ulentsi 23"},
            ])
    })

    it("Address with id 2 should be received correctly", async () => {
        await request(app)
            .get('/addresses/2')
            .expect(200,
                {id: 2, value: "Ulentsi 23"}
            )
    })

    it("Should return 404 for not existing address in case of get", async () => {
        await request(app)
            .get('/addresses/222')
            .expect(404)
    })

    it("Address should be deleted correctly", async () => {
        const initialAddresses = await request(app).get('/addresses')

        await request(app)
            .delete('/addresses/2')
            .expect(204)

        const finalAddresses = await request(app).get('/addresses')
        expect(finalAddresses.body.length).toBe(initialAddresses.body.length - 1)
    })

    it("Should return 404 for not existing address in case of delete", async () => {

        await request(app)
            .delete('/addresses/222')
            .expect(404)

    })


    it("Address value should be updated correctly", async () => {

        const reqAddressBody: ReqAddressBodyModel = {value: "Some Address 333"}
        const resAddress: ResAddressModel = {...reqAddressBody, id: 1}

        // sub-test 1
        await request(app)
            .put('/addresses/1')
            .send(reqAddressBody)
            .expect(resAddress)

        // sub-test 2
        const resAddressGet = await request(app).get('/addresses/1')
        expect(resAddressGet.body).toEqual(resAddress)
    })

    it("Should return 404 for not existing address in case of put", async () => {
        const reqAddressBody: ReqAddressBodyModel = {value: "Some Address 333"}
        await request(app)
            .put('/addresses/222')
            .send(reqAddressBody)
            .expect(404)
    })


    it("Should create new address", async () => {

        const initialState: ResAddressModel[] = await request(app).get('/addresses').then(res => res.body)
        const maxId = initialState.reduce((mId, a) => mId < a.id ? a.id : mId, 0);

        const reqAddressBody: ReqAddressBodyModel = {value: "Some Street 100"}
        const resAddress: ResAddressModel = {...reqAddressBody, id: maxId + 1}


        await request(app)
            .post('/addresses')
            .send(reqAddressBody)
            .expect(201,
                resAddress)

        const finalState: ResAddressModel[] = await request(app).get('/addresses').then(res => res.body)
        expect(finalState.length).toBe(initialState.length + 1)

    })


    it("Should return error where address request body value is empty, " +
        "less than 3 or more than 20 letters" +
        "(cases of post)", async () => {

        let reqAddressBody: ReqAddressBodyModel

        const errorEmpty = {
            type: "field",
            value: "",
            msg: "Shall not be empty",
            path: "value",
            location: "body"
        }

        const errorMinMax = {
            type: "field",
            value: "",
            msg: "length should be from 3 to 20",
            path: "value",
            location: "body"
        }

        // sub-test 1. Empty request body value

        reqAddressBody = {value: ""}

        const error1put = await request(app).put('/addresses/1').send(reqAddressBody).then(res => res.body)
        expect(error1put).toEqual({errors: [errorEmpty, errorMinMax]})

        const error1post = await request(app).post('/addresses').send(reqAddressBody).then(res => res.body)
        expect(error1post).toEqual({errors: [errorEmpty, errorMinMax]})

        // sub-test 2. Request body value less than 3 letters

        reqAddressBody = {value: "a"}

        const error2put = await request(app).put('/addresses/1').send(reqAddressBody).then(res => res.body)
        expect(error2put).toEqual({errors: [{...errorMinMax, value: "a"}]})

        const error2post = await request(app).post('/addresses').send(reqAddressBody).then(res => res.body)
        expect(error2post).toEqual({errors: [{...errorMinMax, value: "a"}]})

        // sub-test 3. Request body value more than 20 letters

        reqAddressBody = {value: "123456789012345678901"}

        const error3put = await request(app).put('/addresses/1').send(reqAddressBody).then(res => res.body)
        expect(error3put).toEqual({errors: [{...errorMinMax, value: "123456789012345678901"}]})

        const error3post = await request(app).post('/addresses').send(reqAddressBody).then(res => res.body)
        expect(error3post).toEqual({errors: [{...errorMinMax, value: "123456789012345678901"}]})

    })


})