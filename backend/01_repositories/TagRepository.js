class TagRepository extends BaseRepository {
  constructor() {
    super(Config.TABLES.TAGS, "Tag_ID");
  }
}

const tagRepo = new TagRepository();
