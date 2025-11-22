const findParents = (arr, id) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].Id === id) {
      return [];
    } else if (arr[i].ChildAssets && arr[i].ChildAssets.length) {
      let t = findParents(arr[i].ChildAssets, id);

      if (t !== false) {
        t.push(arr[i].Id);

        return t;
      }
    }
  }

  return false;
};

let arr = [
  {
    Id: "239297d8-5993-42c0-a6ca-38dac2d8bf9f",
    Name: "SampleSite1",
    ChildAssets: [
      {
        Id: "9ee67548-f511-4d0e-8690-b7e1951ac27f",
        Name: "Plant0",
        ChildAssets: [
          {
            Id: "8678ba42-2d7a-4956-a915-415a457c0196",
            Name: "Area0",
            ChildAssets: [
              {
                Id: "36d02c55-e908-44a5-ba33-07e0125e9eed",
                Name: "Unit0",
                ChildAssets: [],
              },
              {
                Id: "ed1c13ff-d5e5-4fe6-8ce0-bfd5e76b814c",
                Name: "Unit1",
                ChildAssets: [],
              },
              {
                Id: "0d892c0e-01fd-4ea3-a6ab-b8550bc87a5d",
                Name: "Unit2",
                ChildAssets: [],
              },
              {
                Id: "a12d1db9-9b6e-441c-bacc-2d9692b3afb3",
                Name: "Unit3",
                ChildAssets: [],
              },
            ],
          },
          {
            Id: "049c376a-1ef5-45ee-be05-b607cc668fbd",
            Name: "Area1",
            ChildAssets: [
              {
                Id: "edb6404f-8370-401a-bd86-b461f5022d8f",
                Name: "Unit0",
                ChildAssets: [],
              },
              {
                Id: "199afe72-9dce-4cd3-b049-cb3d4be0a956",
                Name: "Unit1",
                ChildAssets: [],
              },
              {
                Id: "8a1b846e-5421-475e-9cc7-cda150cd1ced",
                Name: "Unit2",
                ChildAssets: [],
              },
              {
                Id: "795271e8-be9a-43e9-b751-910dce7ecc36",
                Name: "Unit3",
                ChildAssets: [],
              },
            ],
          },
        ],
      },
      {
        Id: "a8e55efc-9cc6-40ae-bf40-77d84b28d885",
        Name: "Plant1",
        ChildAssets: [
          {
            Id: "87662856-0960-4c4c-991d-705dc7ae67b7",
            Name: "Area0",
            ChildAssets: [
              {
                Id: "37da98ed-5deb-4ee4-8c15-59e8c0a280c0",
                Name: "Unit0",
                ChildAssets: [],
              },
              {
                Id: "2fedd165-a1fa-43e8-9f24-b511a9d86a75",
                Name: "Unit1",
                ChildAssets: [],
              },
              {
                Id: "6c245afa-9f81-487b-aba4-246cae104ece",
                Name: "Unit2",
                ChildAssets: [],
              },
              {
                Id: "ff1dcb66-8cb6-455c-bcb2-386bfdeb90b2",
                Name: "Unit3",
                ChildAssets: [],
              },
            ],
          },
          {
            Id: "15449560-2ae0-43e5-b442-a9a9a6443bbd",
            Name: "Area1",
            ChildAssets: [
              {
                Id: "72cf17bc-fa86-4147-bb4a-0db243e1c090",
                Name: "Unit0",
                ChildAssets: [],
              },
              {
                Id: "793bac08-ab06-4fa7-9fe9-36efebc5f92f",
                Name: "Unit1",
                ChildAssets: [],
              },
              {
                Id: "159f1b72-3133-4bce-898e-08c515207e51",
                Name: "Unit2",
                ChildAssets: [],
              },
              {
                Id: "deb3b828-8f2b-41b9-a2de-41e9e9c5bc31",
                Name: "Unit3",
                ChildAssets: [],
              },
            ],
          },
        ],
      },
      {
        Id: "eb5bc83f-7c10-4427-a07f-602545855efd",
        Name: "Plant2",
        ChildAssets: [
          {
            Id: "b41ba788-f29b-4cda-898b-0794d7017607",
            Name: "Area0",
            ChildAssets: [
              {
                Id: "a63e253e-7712-477b-820f-368bd87c26bd",
                Name: "Unit0",
                ChildAssets: [],
              },
              {
                Id: "6fe78e83-ffcf-4326-96d9-a56f6df7b3d5",
                Name: "Unit1",
                ChildAssets: [],
              },
              {
                Id: "23f87c08-3d35-447e-ac99-4addb6e97909",
                Name: "Unit2",
                ChildAssets: [],
              },
              {
                Id: "c9eed14d-6447-4b45-89d6-1f9bbb3c2586",
                Name: "Unit3",
                ChildAssets: [],
              },
            ],
          },
          {
            Id: "ec36edcf-b7b1-4baa-ab15-43cd04dd0e4f",
            Name: "Area1",
            ChildAssets: [
              {
                Id: "76fdf6ef-b657-4f00-8632-48451f21d40a",
                Name: "Unit0",
                ChildAssets: [],
              },
              {
                Id: "a392264a-8775-4126-82b1-a1bf939c58c3",
                Name: "Unit1",
                ChildAssets: [],
              },
              {
                Id: "13c55334-1420-4431-93a6-805c1dba01d5",
                Name: "Unit2",
                ChildAssets: [],
              },
              {
                Id: "1672db36-dccf-452b-b091-9cf9c17a40c1",
                Name: "Unit3",
                ChildAssets: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

console.log("parentid");

console.log(findParents(arr, "c9eed14d-6447-4b45-89d6-1f9bbb3c2586"));
