package com.pata.keja.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Repairs the invitation issuer foreign key for databases created before
 * landlord-issued caretaker invitations were supported.
 *
 * Hibernate's update mode does not reliably replace an existing foreign key
 * when the target entity changes from the admins subtype table to users.
 */
@Component
public class InvitationSchemaMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(InvitationSchemaMigration.class);
    private static final String TABLE = "invitations";

    private final JdbcTemplate jdbc;

    public InvitationSchemaMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!tableExists(TABLE) || !tableExists("users")) {
            return;
        }

        List<ForeignKeyReference> constraints = jdbc.query(
                """
                select constraint_name, referenced_table_name, referenced_column_name
                from information_schema.key_column_usage
                where table_schema = database()
                  and table_name = 'invitations'
                  and column_name = 'created_by'
                  and referenced_table_name is not null
                """,
                (result, row) -> new ForeignKeyReference(
                        result.getString("constraint_name"),
                        result.getString("referenced_table_name"),
                        result.getString("referenced_column_name")));

        boolean referencesUsers = constraints.stream()
                .anyMatch(constraint -> constraint.references("users", "id"));

        // A previous Hibernate update can leave the old admins FK alongside
        // the new users FK. Remove every stale constraint, not only when no
        // users FK exists, otherwise landlord IDs still fail the insert.
        for (ForeignKeyReference constraint : constraints) {
            if (!constraint.references("users", "id")) {
                jdbc.execute("alter table invitations drop foreign key "
                        + quoteIdentifier(constraint.name()));
            }
        }

        if (!referencesUsers) {
            jdbc.execute(
                    "alter table invitations add constraint fk_invitations_created_by_users "
                            + "foreign key (created_by) references users (id)");
            log.info("Updated invitations.created_by foreign key to reference users.id");
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbc.queryForObject(
                "select count(*) from information_schema.tables where table_schema = database() and table_name = ?",
                Integer.class,
                tableName);
        return count != null && count > 0;
    }

    private static String quoteIdentifier(String identifier) {
        return "`" + identifier.replace("`", "``") + "`";
    }

    private record ForeignKeyReference(String name, String table, String column) {
        private boolean references(String expectedTable, String expectedColumn) {
            return expectedTable.equalsIgnoreCase(table) && expectedColumn.equalsIgnoreCase(column);
        }
    }
}
