/* V0.1.3_0__Create_famous_people_table.sql */
CREATE TABLE IF NOT EXISTS famous_people (
  famous_person_id int GENERATED ALWAYS AS IDENTITY primary key,
  display_name text NOT NULL
);

/*GRANT ALL PRIVILEGES ON TABLE famous_people TO <user>;*/